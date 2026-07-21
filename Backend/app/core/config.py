from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    

    POSTGRES_USER: str = "hospital_user"
    POSTGRES_PASSWORD: str = "hospital123"
    POSTGRES_DB: str = "hospital_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    DATABASE_URL: str = (
        "postgresql+psycopg2://hospital_user:hospital123@localhost:5432/hospital_db"
    )

    SECRET_KEY: str = "change_this_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    
    FRONTEND_ORIGINS: str =( "http://localhost:5173,http://127.0.0.1:5173")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() 
                for origin in self.FRONTEND_ORIGINS.split(",") 
                if origin.strip()
        ]


settings = Settings()
