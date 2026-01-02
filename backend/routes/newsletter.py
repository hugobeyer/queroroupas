from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List
from models import Subscriber, SubscriberCreate, EmailCampaign, EmailCampaignCreate, EmailCampaignUpdate
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

logger = logging.getLogger(__name__)
router = APIRouter()

def get_email_template(campaign: EmailCampaign, primary_color: str = "#ff8637") -> str:
    """Generate HTML email template"""
    image_section = ""
    if campaign.image_url:
        image_section = f'''
        <tr>
            <td style="padding: 0;">
                <img src="{campaign.image_url}" alt="{campaign.title}" style="width: 100%; max-width: 600px; height: auto; display: block;">
            </td>
        </tr>
        '''
    
    html = f'''
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{campaign.title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 30px; text-align: center; background-color: #000000;">
                                <h1 style="margin: 0; color: {primary_color}; font-size: 32px; font-weight: bold;">QUERO ROUPAS</h1>
                            </td>
                        </tr>
                        
                        <!-- Title -->
                        <tr>
                            <td style="padding: 30px 30px 20px; text-align: center;">
                                <h2 style="margin: 0; color: #333333; font-size: 28px; font-weight: bold;">{campaign.title}</h2>
                            </td>
                        </tr>
                        
                        <!-- Image -->
                        {image_section}
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                                {campaign.content}
                            </td>
                        </tr>
                        
                        <!-- CTA Button -->
                        <tr>
                            <td style="padding: 0 30px 40px; text-align: center;">
                                <a href="http://localhost:3000/catalog" style="display: inline-block; padding: 15px 40px; background-color: {primary_color}; color: #000000; text-decoration: none; font-weight: bold; border-radius: 5px; font-size: 16px;">Ver Coleção</a>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 30px; text-align: center; background-color: #f8f8f8; border-top: 1px solid #e0e0e0;">
                                <p style="margin: 0 0 10px; color: #999999; font-size: 14px;">
                                    Quero Roupas - Moda Feminina<br>
                                    Curitiba, Brasil
                                </p>
                                <p style="margin: 0; color: #999999; font-size: 12px;">
                                    Você está recebendo este email porque se inscreveu em nossa newsletter.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    '''
    return html

async def send_email_smtp(to_email: str, subject: str, html_content: str):
    """Send email using SMTP (for demo, logs to console)"""
    # For production, configure actual SMTP server
    logger.info(f"[EMAIL] Sending to: {to_email}")
    logger.info(f"[EMAIL] Subject: {subject}")
    logger.info(f"[EMAIL] Content length: {len(html_content)} chars")
    # In production, use actual SMTP:
    # smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    # smtp_port = int(os.getenv("SMTP_PORT", "587"))
    # smtp_user = os.getenv("SMTP_USER")
    # smtp_password = os.getenv("SMTP_PASSWORD")
    return True

def setup_newsletter_routes(db: AsyncIOMotorDatabase):
    subscribers_collection = db.subscribers
    campaigns_collection = db.campaigns
    settings_collection = db.settings

    # Subscriber routes
    @router.post("/subscribers", response_model=Subscriber)
    async def create_subscriber(subscriber_data: SubscriberCreate):
        try:
            # Check if already exists
            existing = await subscribers_collection.find_one({"email": subscriber_data.email})
            if existing:
                if not existing.get("subscribed", True):
                    # Resubscribe
                    await subscribers_collection.update_one(
                        {"email": subscriber_data.email},
                        {"$set": {"subscribed": True}}
                    )
                return Subscriber(**existing)
            
            subscriber = Subscriber(**subscriber_data.dict())
            await subscribers_collection.insert_one(subscriber.dict())
            return subscriber
        except Exception as e:
            logger.error(f"Error creating subscriber: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/subscribers", response_model=List[Subscriber])
    async def get_subscribers():
        try:
            subscribers = await subscribers_collection.find({"subscribed": True}).to_list(10000)
            return [Subscriber(**s) for s in subscribers]
        except Exception as e:
            logger.error(f"Error fetching subscribers: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.delete("/subscribers/{subscriber_id}")
    async def delete_subscriber(subscriber_id: str):
        try:
            result = await subscribers_collection.update_one(
                {"id": subscriber_id},
                {"$set": {"subscribed": False}}
            )
            if result.modified_count > 0:
                return {"message": "Subscriber unsubscribed"}
            raise HTTPException(status_code=404, detail="Subscriber not found")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting subscriber: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    # Campaign routes
    @router.get("/campaigns", response_model=List[EmailCampaign])
    async def get_campaigns():
        try:
            campaigns = await campaigns_collection.find().sort("createdAt", -1).to_list(1000)
            return [EmailCampaign(**c) for c in campaigns]
        except Exception as e:
            logger.error(f"Error fetching campaigns: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.post("/campaigns", response_model=EmailCampaign)
    async def create_campaign(campaign_data: EmailCampaignCreate):
        try:
            campaign = EmailCampaign(**campaign_data.dict())
            await campaigns_collection.insert_one(campaign.dict())
            return campaign
        except Exception as e:
            logger.error(f"Error creating campaign: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.put("/campaigns/{campaign_id}", response_model=EmailCampaign)
    async def update_campaign(campaign_id: str, campaign_data: EmailCampaignUpdate):
        try:
            update_dict = {k: v for k, v in campaign_data.dict().items() if v is not None}
            
            if not update_dict:
                raise HTTPException(status_code=400, detail="No fields to update")
            
            result = await campaigns_collection.find_one_and_update(
                {"id": campaign_id},
                {"$set": update_dict},
                return_document=True
            )
            
            if result:
                return EmailCampaign(**result)
            raise HTTPException(status_code=404, detail="Campaign not found")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating campaign: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.delete("/campaigns/{campaign_id}")
    async def delete_campaign(campaign_id: str):
        try:
            result = await campaigns_collection.delete_one({"id": campaign_id})
            if result.deleted_count > 0:
                return {"message": "Campaign deleted"}
            raise HTTPException(status_code=404, detail="Campaign not found")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting campaign: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.post("/campaigns/{campaign_id}/send")
    async def send_campaign(campaign_id: str, background_tasks: BackgroundTasks):
        try:
            campaign = await campaigns_collection.find_one({"id": campaign_id})
            if not campaign:
                raise HTTPException(status_code=404, detail="Campaign not found")
            
            campaign_obj = EmailCampaign(**campaign)
            
            # Get subscribers
            subscribers = await subscribers_collection.find({"subscribed": True}).to_list(10000)
            
            if not subscribers:
                raise HTTPException(status_code=400, detail="No subscribers found")
            
            # Get site settings for colors
            settings = await settings_collection.find_one({"id": "site_settings"})
            primary_color = settings.get("color_primary", "#ff8637") if settings else "#ff8637"
            
            # Generate email HTML
            html_content = get_email_template(campaign_obj, primary_color)
            
            # Send emails (in production, use background task)
            sent_count = 0
            for subscriber in subscribers:
                try:
                    await send_email_smtp(
                        subscriber["email"],
                        campaign_obj.subject,
                        html_content
                    )
                    sent_count += 1
                except Exception as e:
                    logger.error(f"Error sending to {subscriber['email']}: {e}")
            
            # Update campaign
            await campaigns_collection.update_one(
                {"id": campaign_id},
                {
                    "$set": {
                        "sent": True,
                        "sent_count": sent_count,
                        "sentAt": datetime.utcnow()
                    }
                }
            )
            
            return {
                "message": f"Campaign sent to {sent_count} subscribers",
                "sent_count": sent_count
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error sending campaign: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/campaigns/{campaign_id}/preview")
    async def preview_campaign(campaign_id: str):
        try:
            campaign = await campaigns_collection.find_one({"id": campaign_id})
            if not campaign:
                raise HTTPException(status_code=404, detail="Campaign not found")
            
            campaign_obj = EmailCampaign(**campaign)
            
            # Get site settings for colors
            settings = await settings_collection.find_one({"id": "site_settings"})
            primary_color = settings.get("color_primary", "#ff8637") if settings else "#ff8637"
            
            html_content = get_email_template(campaign_obj, primary_color)
            
            return {"html": html_content}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error previewing campaign: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    return router
