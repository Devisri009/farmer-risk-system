from fastapi import APIRouter, UploadFile, File, Form, Header, Depends, HTTPException
from typing import List, Optional
import time
import os
import shutil
import uuid
import logging
from sqlalchemy.orm import Session
from sqlalchemy import desc

from . import models, schemas, auth
from .database import get_db

logger = logging.getLogger(__name__)

router = APIRouter()

# --- Upload directory for images & voice ---
UPLOAD_DIR = "static/uploads/community"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ──────────────────────────────────────────────────────────
# DISCOVERY ROUTES (must be BEFORE /{post_id} to avoid clash)
# ──────────────────────────────────────────────────────────

@router.get("/trending-tags")
def get_trending_tags(db: Session = Depends(get_db)):
    # Count tags from real posts in DB
    from sqlalchemy import func
    tags = db.query(models.CommunityPost.crop_type, func.count(models.CommunityPost.id).label('count'))\
             .group_by(models.CommunityPost.crop_type)\
             .order_by(desc('count'))\
             .limit(5).all()
    
    if not tags:
        return [{"tag": "#StartPosting", "posts": 0}]
    return [{"tag": f"#{t[0]}", "posts": t[1]} for t in tags if t[0]]


@router.get("/suggestions")
def get_suggestions():
    return [
        {"id": "u1", "name": "Priya Farms", "location": "Trichy", "avatar": "👩‍🌾"},
        {"id": "u2", "name": "Karthik Agri", "location": "Erode", "avatar": "🧑‍🌾"},
        {"id": "u3", "name": "Meena Crops", "location": "Vellore", "avatar": "👩‍🌾"},
    ]


@router.get("/stories")
def get_stories():
    return [
        {"id": "me", "name": "Your Story", "avatar": "➕", "isYours": True},
        {"id": "s1", "name": "Ramesh", "avatar": "🧑‍🌾", "active": True},
        {"id": "s2", "name": "Anita", "avatar": "👩‍🌾", "active": True},
    ]


# ──────────────────────────────────────────────────────────
# CORE FEED ROUTES
# ──────────────────────────────────────────────────────────

@router.get("")
def get_feed_posts(
    page: int = 1, 
    limit: int = 10, 
    tag: Optional[str] = None, 
    crop: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.CommunityPost)
    
    if tag and tag != "all":
        query = query.filter(models.CommunityPost.tag == tag)
    if crop:
        query = query.filter(models.CommunityPost.crop_type.ilike(f"%{crop}%"))

    total = query.count()
    posts_db = query.order_by(desc(models.CommunityPost.created_at))\
                    .offset((page - 1) * limit)\
                    .limit(limit).all()

    # Format for frontend
    formatted_posts = []
    for p in posts_db:
        # Check if user liked it
        liked_by_me = False # In a full app, check against PostLike table
        
        formatted_posts.append({
            "id": str(p.id),
            "author": p.author.name if p.author else "Farmer",
            "username": p.author.username if p.author else "farmer",
            "avatar": p.author.avatar if (p.author and p.author.avatar) else "👨‍🌾",
            "location": p.location or (f"{p.author.village}, {p.author.district}" if p.author else "Tamil Nadu, India"),
            "content": p.content,
            "image_url": p.image_url,
            "audio_url": p.audio_url,
            "tag": p.tag,
            "cropType": p.crop_type,
            "likes": len(p.likes),
            "likedByMe": liked_by_me,
            "commentsCount": len(p.comments),
            "createdAt": p.created_at.isoformat() if p.created_at else None
        })

    return {
        "posts": formatted_posts,
        "total": total,
        "page": page,
        "pages": max(1, (total + limit - 1) // limit)
    }


@router.post("")
async def create_feed_post(
    content: str = Form(...),
    tag: str = Form(...),
    cropType: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Save uploads
    image_url = None
    if image and image.filename:
        ext = os.path.splitext(image.filename)[1] or ".jpg"
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/static/uploads/community/{filename}"

    audio_url = None
    if audio and audio.filename:
        ext = os.path.splitext(audio.filename)[1] or ".webm"
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        audio_url = f"/static/uploads/community/{filename}"

    # Use user's real name and location
    loc_str = f"{current_user.village}, {current_user.district}" if current_user.district else "Tamil Nadu, India"

    new_post = models.CommunityPost(
        user_id=current_user.id,
        content=content,
        tag=tag,
        crop_type=cropType,
        location=loc_str,
        image_url=image_url,
        audio_url=audio_url
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    return {
        "id": str(new_post.id),
        "author": current_user.name,
        "location": loc_str,
        "content": content,
        "tag": tag,
        "cropType": cropType,
        "createdAt": new_post.created_at.isoformat()
    }


@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    db.delete(post)
    db.commit()
    return {"status": "success"}


# ──────────────────────────────────────────────────────────
# INTERACTIONS
# ──────────────────────────────────────────────────────────

@router.post("/{post_id}/like")
def toggle_like(post_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    existing_like = db.query(models.PostLike).filter(
        models.PostLike.post_id == post_id,
        models.PostLike.user_id == current_user.id
    ).first()

    if existing_like:
        db.delete(existing_like)
        liked = False
    else:
        new_like = models.PostLike(post_id=post_id, user_id=current_user.id)
        db.add(new_like)
        liked = True

    db.commit()
    
    # Get total count
    count = db.query(models.PostLike).filter(models.PostLike.post_id == post_id).count()
    return {"liked": liked, "likes": count}


@router.post("/{post_id}/save")
def toggle_save(post_id: int, current_user: models.User = Depends(auth.get_current_user)):
    # Placeholder for bookmark/save feature (logic to be added to DB if needed)
    return {"saved": True}


@router.get("/{post_id}/comments")
def get_comments(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(models.PostComment).filter(models.PostComment.post_id == post_id).all()
    return [{
        "id": c.id,
        "author": c.author.name if c.author else "Farmer",
        "avatar": c.author.avatar if (c.author and c.author.avatar) else "👨‍🌾",
        "content": c.content,
        "createdAt": c.created_at.isoformat()
    } for c in comments]


@router.post("/{post_id}/comments")
def add_comment(post_id: int, payload: dict, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    new_comment = models.PostComment(
        post_id=post_id,
        user_id=current_user.id,
        content=payload.get("text", "")
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)

    return {
        "id": new_comment.id,
        "author": current_user.name,
        "avatar": current_user.avatar,
        "content": new_comment.content,
        "createdAt": new_comment.created_at.isoformat()
    }


@router.delete("/{post_id}/comments/{comment_id}")
def delete_comment(post_id: int, comment_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    comment = db.query(models.PostComment).filter(
        models.PostComment.id == comment_id,
        models.PostComment.post_id == post_id
    ).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    db.delete(comment)
    db.commit()
    return {"status": "success"}


@router.post("/follow/{user_id}")
def follow_user(user_id: str):
    return {"status": "success"}


# ──────────────────────────────────────────────────────────
# AI SUGGESTION (Uses Hybrid Brain: OpenRouter + Gemini)
# ──────────────────────────────────────────────────────────

@router.post("/{post_id}/ai-suggestion")
async def get_ai_suggestion(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()

    if not post:
        return {"suggestion": "Post not found."}

    content = post.content or ""
    crop_type = post.crop_type or ""

    # Use the Hybrid AI Brain (OpenRouter → Gemini fallback)
    try:
        from . import ai_service
        prompt = f"""You are a professional agricultural advisor for FarmVista.
A farmer shared this in the community:

Post: "{content}"
Crop: {crop_type if crop_type else "Not specified"}

Provide helpful advice in this format:
1. **Key Observation**: What you notice (1-2 sentences)
2. **Recommended Actions**: Practical steps (2-3 bullet points)
3. **Pro Tip**: One expert-level tip

Keep it simple, practical, and farmer-friendly."""

        reply, error = await ai_service.generate_ai_response(prompt)
        if reply:
            return {"suggestion": reply}
        if error:
            logger.warning(f"AI suggestion error: {error}")
    except Exception as e:
        logger.error(f"AI suggestion failed: {e}")

    # Fallback
    return {
        "suggestion": f"**AI Crop Doctor** 🌱\n\nThank you for sharing about {crop_type or 'your crop'}.\n\n**Recommended Actions:**\n• Monitor your crop daily for any changes\n• Check local weather forecasts\n• Consider consulting your nearest KVK\n\n**Pro Tip:** Keep a crop diary to track growth patterns over time!"
    }
