from flask import render_template, request, jsonify, redirect, url_for, flash
from flask_login import login_user, current_user, logout_user, login_required
from app_init import app, db, bcrypt, login_manager, socketio
from models import User, Task
from analytics import get_task_analytics

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def index():
    if current_user.is_authenticated:
        return render_template('dashboard.html')
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user_exists = User.query.filter_by(username=username).first()
        if user_exists:
            flash('Username already exists. Please choose a different one.', 'danger')
            return redirect(url_for('register'))
            
        hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
        user = User(username=username, password_hash=hashed_pw)
        db.session.add(user)
        db.session.commit()
        
        flash('Your account has been created! You can now log in.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        
        if user and bcrypt.check_password_hash(user.password_hash, password):
            login_user(user, remember=True)
            return redirect(url_for('index'))
        else:
            flash('Login Unsuccessful. Please check username and password', 'danger')
    return render_template('login.html')

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('login'))

# API REQUIREMENT: Get All Tasks
@app.route('/api/tasks', methods=['GET'])
@login_required
def get_tasks():
    tasks = Task.query.filter_by(user_id=current_user.id).order_by(Task.created_date.desc()).all()
    return jsonify([task.to_dict() for task in tasks])

# API REQUIREMENT: Add Task (Fields: Title, Description, Priority, Status, Created Date)
@app.route('/api/tasks', methods=['POST'])
@login_required
def add_task():
    data = request.get_json()
    title = data.get('title')
    description = data.get('description', '')
    priority = data.get('priority', 'Medium')
    
    if not title:
        return jsonify({'error': 'Title is required'}), 400
        
    task = Task(title=title, description=description, priority=priority, user_id=current_user.id)
    db.session.add(task)
    db.session.commit()
    
    socketio.emit('task_update', {'action': 'add'}, room=None)
    
    return jsonify(task.to_dict()), 201

# API REQUIREMENT: Update Task
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@login_required
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    data = request.get_json()
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'priority' in data:
        task.priority = data['priority']
    if 'status' in data:
        task.status = data['status']
        
    db.session.commit()
    
    socketio.emit('task_update', {'action': 'update'}, room=None)
    
    return jsonify(task.to_dict())

# API REQUIREMENT: Delete Task
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    if task.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    db.session.delete(task)
    db.session.commit()
    
    socketio.emit('task_update', {'action': 'delete'}, room=None)
    
    return jsonify({'message': 'Task deleted'})

@app.route('/api/analytics', methods=['GET'])
@login_required
def get_analytics():
    tasks = Task.query.filter_by(user_id=current_user.id).all()
    tasks_dict = [task.to_dict() for task in tasks]
    stats = get_task_analytics(tasks_dict)
    return jsonify(stats)
