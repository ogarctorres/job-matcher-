"""Configuração do banco de dados SQLite com SQLAlchemy."""

import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Caminho absoluto determinístico para o banco SQLite na raiz do backend ou configurável via ENV
BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = BASE_DIR / "jobmatcher.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH.as_posix()}")

# check_same_thread=False é fundamental para o FastAPI que trabalha com threads assíncronas
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Classe base para todos os modelos."""
    pass


def get_db():
    """Gera uma sessão do banco para uso com Depends() do FastAPI com encerramento garantido."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def criar_tabelas():
    """Cria todas as tabelas no banco se não existirem e aplica migrações defensivas seguras."""
    import app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)

    # Migração defensiva leve para SQLite (garante coluna user_id sem requerer Alembic)
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        for tabela in ["analises", "curriculos_adaptados"]:
            if tabela in inspector.get_table_names():
                colunas = [c["name"] for c in inspector.get_columns(tabela)]
                if "user_id" not in colunas:
                    with engine.begin() as conn:
                        conn.execute(text(f"ALTER TABLE {tabela} ADD COLUMN user_id VARCHAR(100)"))
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Aviso na verificação de migração: {e}")


