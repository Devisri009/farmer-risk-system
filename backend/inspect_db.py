
from app.database import engine
from sqlalchemy import inspect

inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"Tables: {tables}")

for table in tables:
    print(f"Table: {table}")
    for column in inspector.get_columns(table):
        print(f"  Column: {column['name']}, Type: {column['type']}")
