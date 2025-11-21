from sqlmodel import Session, SQLModel, create_engine


SQLITE_URL = "sqlite:////data/test.db"

class SQLiteDB:
    connect_args = {"check_same_thread": False}
    engine = create_engine(SQLITE_URL, connect_args=connect_args)

    @classmethod
    def create_db_and_tables(cls):
        SQLModel.metadata.create_all(cls.engine)

    @classmethod
    def get_session(cls):
        with Session(cls.engine) as session:
            yield session
