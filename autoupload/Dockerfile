FROM python:3

RUN mkdir /autoploadserver

WORKDIR /autoploadserver

RUN pip install --upgrade pip
COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .

RUN python manage.py makemigrations
RUN python manage.py migrate

EXPOSE 8000

# ENTRYPOINT [ "python","manage.py","runserver" ]
CMD [ "gunicorn","--bind","0.0.0.0:8000","autoupload.wsgi:application" ]