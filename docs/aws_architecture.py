import os
import shutil
from diagrams import Diagram, Cluster, Edge
from diagrams.aws.network import CloudFront, Route53
from diagrams.aws.security import CertificateManager as ACM
from diagrams.aws.storage import S3, ElasticBlockStoreEBS as EBS
from diagrams.aws.compute import EC2
from diagrams.aws.database import ElastiCache, RDS
from diagrams.aws.management import Cloudwatch
from diagrams.aws.general import Users
from diagrams.aws.integration import SimpleNotificationServiceSnsEmailNotification as EmailService
from diagrams.onprem.network import Nginx
from diagrams.programming.language import Nodejs, Python

graph_attr = {
    "fontsize": "16",
    "pad": "0.6",
    "splines": "ortho",
    "nodesep": "0.8",
    "ranksep": "1.2",
    "bgcolor": "#FFFFFF"
}


with Diagram(
    "Arquitectura Completa MexxicanMX - AWS Cloud & Docker Stack",
    filename="aws_architecture",
    show=False,
    direction="TB",
    graph_attr=graph_attr,
):
    users = Users("Comensales & Restaurantes\n(Dispositivos Web / QR)")

    with Cluster("DNS Zone (Hostinger & Route53)"):
        dns = Route53("Hostinger DNS Zone\noamdevsol.site\nRegistros CNAME / A")

    with Cluster("Seguridad SSL / TLS"):
        acm = ACM("AWS Certificate Manager\nCertificado SSL Wildcard\n(*.oamdevsol.site)")

    with Cluster("Red de Distribución de Contenido (AWS CloudFront CDN)"):
        cloudfront = CloudFront("AWS CloudFront CDN\n(Terminación HTTPS Global)")

    with Cluster("Almacenamiento de Archivos Estáticos (AWS S3 Buckets)"):
        mexxicanmx_app = S3("mexxicanmx.oamdevsol.site\n(App Cliente / Menú QR)")
        admin_app = S3("admin.oamdevsol.site\n(Panel Admin Restaurante)")
        s3_images = S3("images.oamdevsol.site\n(Fotos HD de Platillos)")

    with Cluster("Servidor de Cómputo AWS EC2 (Docker Microservices Stack)"):
        ec2_server = EC2("AWS EC2 Instance\n(Ubuntu 24.04 LTS)")
        nginx = Nginx("Nginx Reverse Proxy\n(Enrutamiento HTTPS / Headers)")

        with Cluster("Contenedores Docker de Microservicios"):
            api_backend = Nodejs("api.oamdevsol.site\n(API REST Node.js Express)")
            ml_service = Python("ml-service:8000\n(Motor IA / FastAPI Python)")
            monitor_backend = Cloudwatch("monitor.oamdevsol.site\n(Dashboard Uptime)")

        with Cluster("Base de Datos & Caching"):
            postgres = RDS("PostgreSQL 16 + pgvector\n(Persistencia & Embeddings)")
            redis = ElastiCache("Redis Cache 7\n(Caché Consultas IA & SSE)")

        ebs = EBS("EBS 20 GB gp3\n(Volumen Persistente DB)")

    with Cluster("Notificaciones Transactional"):
        resend_email = EmailService("Resend API\n(Envío de Correos OTP / Alertas)")

    # Conexiones principales del flujo
    users >> Edge(label="1. Tráfico HTTPS / QR Scan", color="#E1A339", style="bold") >> dns
    dns >> Edge(label="2a. CNAME Frontend / CDN", color="#C0421F") >> cloudfront
    dns >> Edge(label="2b. CNAME API / Backend", color="#2997FF") >> nginx

    acm - Edge(color="#6E8B4C", style="dotted", label="SSL Cert") - cloudfront
    acm - Edge(color="#6E8B4C", style="dotted", label="SSL Cert") - nginx

    cloudfront >> Edge(label="Sirve PWA Cliente", color="#C0421F") >> mexxicanmx_app
    cloudfront >> Edge(label="Sirve Dashboard Admin", color="#E1A339") >> admin_app

    nginx >> Edge(label="Proxy /api/*", color="#2997FF") >> api_backend
    nginx >> Edge(label="Proxy /monitor", color="#6E8B4C") >> monitor_backend

    api_backend >> Edge(label="HTTP JSON Recommend", color="#C0421F", style="bold") >> ml_service
    api_backend >> Edge(label="SQL Read/Write", color="#2997FF") >> postgres
    api_backend >> Edge(label="Cache & PubSub", color="#E1A339") >> redis

    ml_service >> Edge(label="Vector Search (pgvector)", color="#9C27B0", style="bold") >> postgres
    ml_service >> Edge(label="Cache Check", color="#E1A339") >> redis

    postgres >> Edge(label="Persistencia", color="#666666") >> ebs
    api_backend >> Edge(label="Upload Imágenes Directo", color="#E1A339") >> s3_images
    api_backend >> Edge(label="Envío de Emails OTP", color="#C0421F") >> resend_email

# Generar y copiar imágenes
os.makedirs("presentacion/diagramas", exist_ok=True)
if os.path.exists("aws_architecture.png"):
    shutil.copy("aws_architecture.png", "arquitectura.png")
    shutil.copy("aws_architecture.png", "presentacion/diagramas/aws_architecture.png")
    print("[OK] aws_architecture.png generado y actualizado exitosamente en todas las rutas.")
