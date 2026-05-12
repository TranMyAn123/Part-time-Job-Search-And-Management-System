echo "=== Cài đặt thư viện ==="
pip install -r requirements.txt

echo "=== Migrate database ==="
python manage.py migrate

echo "=== Tạo superuser ==="
export DJANGO_SUPERUSER_USERNAME=admin
export DJANGO_SUPERUSER_EMAIL=admin@example.com
export DJANGO_SUPERUSER_PASSWORD=Admin@123

python manage.py createsuperuser --no-input || echo "Superuser đã tồn tại!"

echo "=== Run server ==="
python manage.py runserver