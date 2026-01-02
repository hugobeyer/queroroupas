from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid

class ProductBase(BaseModel):
    name: str
    price: float
    image: str
    category: str
    isNew: bool = False
    stock_quantity: int = 0
    cost_price: float = 0

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None
    category: Optional[str] = None
    isNew: Optional[bool] = None
    stock_quantity: Optional[int] = None
    cost_price: Optional[float] = None

class Product(ProductBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

# User Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "customer"  # admin or customer

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Settings Models
class SiteSettings(BaseModel):
    id: str = Field(default="site_settings")
    
    # Contact Info
    city: str = "Curitiba"
    phone: str = "+55 63 9935-6204"
    email: str = "contato@queroroupas.com"
    
    # Hero Section
    hero_title: str = "Nova Coleção"
    hero_subtitle: str = "Quer se vestir pro verão 2025?"
    hero_description: str = "Elegância e sofisticação em cada peça"
    hero_images: List[str] = [
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80"
    ]
    
    # Logos
    logo_header: str = "https://customer-assets.emergentagent.com/job_ladies-boutique-1/artifacts/nk1o3pp5_queroroupas-text-logo.png"
    logo_banner: str = "https://customer-assets.emergentagent.com/job_ladies-boutique-1/artifacts/c47pjt03_queroroupas-logo.png"
    logo_footer: str = "https://customer-assets.emergentagent.com/job_ladies-boutique-1/artifacts/nk1o3pp5_queroroupas-text-logo.png"
    
    # Colors
    color_primary: str = "#ff8637"  # Orange/Yellow
    color_secondary: str = "#2e081c"  # Burgundy
    color_background: str = "#000000"  # Black
    
    # Featured Section
    featured_title: str = "Destaques"
    featured_description: str = "Conheça nossas peças mais desejadas"
    
    # CTA Section
    cta_title: str = "Receba Novidades"
    cta_description: str = "Inscreva-se para receber em primeira mão nossas promoções e lançamentos"
    
    # Categories
    categories: List[str] = [
        "Vestidos",
        "Blusas",
        "Calças",
        "Saias",
        "Conjuntos",
        "Blazers",
        "Tops",
        "Shorts",
        "Jaquetas"
    ]
    
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class SiteSettingsUpdate(BaseModel):
    city: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_description: Optional[str] = None
    hero_images: Optional[List[str]] = None
    logo_header: Optional[str] = None
    logo_banner: Optional[str] = None
    logo_footer: Optional[str] = None
    color_primary: Optional[str] = None
    color_secondary: Optional[str] = None
    color_background: Optional[str] = None
    featured_title: Optional[str] = None
    featured_description: Optional[str] = None
    cta_title: Optional[str] = None
    cta_description: Optional[str] = None
    categories: Optional[List[str]] = None

# Newsletter Models
class Subscriber(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    subscribed: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class SubscriberCreate(BaseModel):
    email: EmailStr

class EmailCampaign(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    subject: str
    content: str
    image_url: Optional[str] = None
    sent: bool = False
    sent_count: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    sentAt: Optional[datetime] = None

class EmailCampaignCreate(BaseModel):
    title: str
    subject: str
    content: str
    image_url: Optional[str] = None

class EmailCampaignUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None