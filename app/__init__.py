from flask import Flask

def create_app():
    app = Flask(__name__)

    from app.routes.main import main_blueprint
    from app.routes.core_leagues import core_sport_blueprint

    app.register_blueprint(main_blueprint)
    app.register_blueprint(core_sport_blueprint)
    
    return app