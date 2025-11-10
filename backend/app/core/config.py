from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv(override=True)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra='ignore') 
    
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str

    DB_USER: str
    DB_PASS: str
    DB_HOST: str
    DB_PORT: str
    DB_NAME: str

    # class Config:
    #     env_file = ".env"
    #     env_file_encoding = "utf-8"
    #     extra



settings = Settings()