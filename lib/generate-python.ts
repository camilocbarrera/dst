import { ParsedYAML } from '../types/dag'

export function generatePythonDAG(dagml: ParsedYAML): string {
  const operators = new Set(dagml.tasks?.map(task => task.operator) || []);
  const operatorImports = Array.from(operators).map(operator => 
    `from airflow.operators.${operator.toLowerCase()} import ${operator}`
  ).join('\n');

  const tasks = dagml.tasks?.map(task => {
    let taskParams = '';
    if (task.operator === 'BashOperator') {
      taskParams = `bash_command='${task.bash_command || ''}'`;
    } else if (task.operator === 'PythonOperator') {
      taskParams = `python_callable=${task.python_callable || 'None'}`;
    }
    return `
    ${task.task_id} = ${task.operator}(
        task_id='${task.task_id}',
        ${taskParams}
    )`;
  }).join('\n') || '';

  const dependencies = dagml.dependencies?.map(dep => 
    `    ${dep[0]} >> ${dep[1]}`
  ).join('\n') || '';

  const defaultArgs = dagml.dag?.default_args ? JSON.stringify(dagml.dag.default_args, null, 4) : '{}';

  return `
from airflow import DAG
from datetime import datetime, timedelta
${operatorImports}

default_args = ${defaultArgs}

with DAG(
    '${dagml.dag?.dag_id || 'generated_dag'}',
    default_args=default_args,
    description='Generated DAG from DAGML',
    schedule_interval='${dagml.dag?.schedule_interval || '@daily'}',
    start_date=datetime.strptime('${dagml.dag?.start_date || '2024-01-01'}', '%Y-%m-%d'),
    catchup=False,
) as dag:

    # Tasks definition
${tasks}

    # Dependencies
${dependencies}
`;
}


