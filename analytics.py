import pandas as pd
import numpy as np

def get_task_analytics(tasks):
    if not tasks:
        return {
            'total_tasks': 0,
            'completed_tasks': 0,
            'pending_tasks': 0,
            'completion_percentage': 0.0
        }
    
    df = pd.DataFrame(tasks)
    
    total_tasks = int(df.shape[0])
    completed_tasks = int(np.sum(np.where(df['status'] == 'Completed', 1, 0)))
    pending_tasks = total_tasks - completed_tasks
    
    completion_percentage = 0.0
    if total_tasks > 0:
        completion_percentage = round((completed_tasks / total_tasks) * 100, 2)
        
    return {
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'pending_tasks': pending_tasks,
        'completion_percentage': completion_percentage
    }
