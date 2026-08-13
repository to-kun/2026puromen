from flask_frozen import Freezer
from app import app

app.config['FREEZER_DESTINATION'] = 'docs'

freezer = Freezer(app)

# 404エラーが発生してもビルドを中断せずに無視する設定（開発中の場合）
app.config['FREEZER_IGNORE_404_NOT_FOUND'] = True
app.config['FREEZER_RELATIVE_URLS'] = True

if __name__ == "__main__":
    freezer.freeze()