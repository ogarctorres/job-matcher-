import os
from dotenv import load_dotenv

load_dotenv()

ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY")

PAIS = "br"
LOCALIZACAO = "São Paulo"
DISTANCIA_KM = 15