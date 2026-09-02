from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Permite que seu HTML/JS front-end converse com o Python

# Banco de dados fictício em memória (Simulador do "Sistema")
user_status = {
    "lvl": 5,
    "exp": 45,
    "exercicios": [
        {"id": 1, "nome": "SUPINO RETO DO CAÇADOR", "tag": "RECOMENDADO LVL 5", "carga": 60},
        {"id": 2, "nome": "AGACHAMENTO DOS PORTAIS", "tag": "RECOMENDADO LVL 7", "carga": 80}
    ]
}

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify(user_status)

@app.route('/api/update-carga', methods=['POST'])
def update_carga():
    data = request.json
    exercicio_id = data.get("id")
    nova_carga = data.get("carga")
    
    # Atualiza a carga no nosso "banco de dados"
    for ex in user_status["exercicios"]:
        if ex["id"] == exercicio_id:
            ex["carga"] = nova_carga
            return jsonify({"success": True, "message": "Carga atualizada!", "exercicios": user_status["exercicios"]})
            
    return jsonify({"success": False, "message": "Exercício não encontrado"}), 404

if __name__ == '__main__':
    # Roda o servidor local na porta 5000
    app.run(debug=True, port=5000)
