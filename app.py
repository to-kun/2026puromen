from flask import Flask, render_template

app = Flask(__name__)

# トップページ（HTMLテンプレートの表示）
@app.route("/")
@app.route('/index.html') 
def index():
    return render_template('index.html')

@app.route('/archive.html')
def archive():
    return render_template('archive.html')

if __name__ == "__main__":
    app.run(debug=True)
    
#http://127.0.0.1:5000
