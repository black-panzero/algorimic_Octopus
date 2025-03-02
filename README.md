# Algorimic - AI Research Platform

A modern web application for AI research and interaction, featuring a beautiful glassmorphic UI design and real-time chat capabilities.

## Features

- 🎨 Modern glassmorphic UI design
- 💬 Real-time chat interface with AI assistant
- 🔐 User authentication system
- 📱 Responsive design with sidebar navigation
- 🌓 Dark mode support
- 🎯 Dashboard with research metrics
- 🤖 AI agent management

## Tech Stack

- Python 3.8+
- Django 3.2+
- HTML5/CSS3
- JavaScript (ES6+)
- Font Awesome 6.0
- Inter Font Family

## Installation

1. Clone the repository:
```bash
git clone https://github.com/black_panzero/algorimic.git
cd algorimic
```

2. Create and activate a virtual environment:
```bash
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Apply database migrations:
```bash
python manage.py migrate
```

5. Create a superuser (admin):
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver
```

The application will be available at `http://localhost:8000`

## Project Structure

```
algorimic/
├── app/                    # Main Django app
├── static/                 # Static files (CSS, JS, images)
│   ├── css/               # CSS stylesheets
│   ├── js/                # JavaScript files
│   └── images/            # Image assets
├── templates/             # HTML templates
│   ├── main/             # Main application templates
│   └── registration/     # Authentication templates
├── manage.py             # Django management script
└── requirements.txt      # Project dependencies
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inter font by Rasmus Andersson
- Font Awesome for icons
- Django community for the amazing framework 