from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DB_NAME: str
    DB_USER: str
    DB_HOST: str
    DB_PASSWORD: str
    DB_PORT: str

    # Cloudflare R2
    R2_ACCOUNT_ID: str
    R2_ACCESS_KEY_ID: str
    R2_SECRET_ACCESS_KEY: str
    R2_BUCKET_NAME: str
    R2_ENDPOINT_URL: str

    # TELEGRAM
    TELEGRAM_TOKEN_BOT: str
    TELEGRAM_CHAT_ID: str

    # Vendedor
    VENDEDOR_WHATSAPP: str

    SECRET_KEY:                    str
    ACCESS_TOKEN_EXPIRE_MINUTES:   int = 480
    ADMIN_USERNAME:                str
    ADMIN_PASSWORD:                str

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+aiomysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    class Config:
        env_file = ".env"

settings = Settings()