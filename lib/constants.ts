import { editor } from 'monaco-editor'

export const EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 14,
  lineNumbers: 'on',
  roundedSelection: false,
  scrollbar: {
    useShadows: false,
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
    alwaysConsumeMouseWheel: false
  },
  lineNumbersMinChars: 3,
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  overviewRulerBorder: false
}

export const EXAMPLES = {
  dagml: {
    simple: `# Example DAGML file (my_dagml.dagml)
dag:
  dag_id: example_dag
  schedule_interval: '@daily'
  start_date: '2024-09-01'

tasks:
  - task_id: start_task
    operator: BashOperator
    bash_command: 'echo Start'
  
  - task_id: process_task
    operator: PythonOperator
    python_callable: process_data
  
  - task_id: email_task
    operator: EmailOperator
    to: 'user@example.com'
    subject: DAG Complete
    html_content: 'The DAG has finished processing.'
  
  - task_id: end_task
    operator: BashOperator
    bash_command: 'echo End'

dependencies:
  - [start_task, process_task]
  - [process_task, email_task]
  - [email_task, end_task]`,
    complex: `# Complex DAGML file (complex_dagml.yaml)
# S3 to Snowflake DAGML file (s3_to_snowflake_dagml.yaml)
dag:
  dag_id: s3_to_snowflake_parallel_dag
  schedule_interval: '@daily'
  start_date: '2024-10-01'

tasks:
  - task_id: start
    operator: BashOperator
    bash_command: 'echo "Start S3 to Snowflake Data Pipeline"'

  - task_id: extract_data_task1
    operator: PythonOperator
    python_callable: extract_data_from_s3
    op_kwargs:
      s3_bucket: 'my-bucket'
      s3_key: 'data/file1.csv'

  - task_id: extract_data_task2
    operator: PythonOperator
    python_callable: extract_data_from_s3
    op_kwargs:
      s3_bucket: 'my-bucket'
      s3_key: 'data/file2.csv'

  - task_id: extract_data_task3
    operator: PythonOperator
    python_callable: extract_data_from_s3
    op_kwargs:
      s3_bucket: 'my-bucket'
      s3_key: 'data/file3.csv'

  - task_id: transform_data_task1
    operator: PythonOperator
    python_callable: transform_data
    op_kwargs:
      file_path: '/tmp/file1.csv'

  - task_id: transform_data_task2
    operator: PythonOperator
    python_callable: transform_data
    op_kwargs:
      file_path: '/tmp/file2.csv'

  - task_id: transform_data_task3
    operator: PythonOperator
    python_callable: transform_data
    op_kwargs:
      file_path: '/tmp/file3.csv'

  - task_id: load_data_to_snowflake_task1
    operator: PythonOperator
    python_callable: load_data_to_snowflake
    op_kwargs:
      file_path: '/tmp/transformed_file1.csv'
      table_name: snowflake_table_1

  - task_id: load_data_to_snowflake_task2
    operator: PythonOperator
    python_callable: load_data_to_snowflake
    op_kwargs:
      file_path: '/tmp/transformed_file2.csv'
      table_name: 'snowflake_table_2'

  - task_id: load_data_to_snowflake_task3
    operator: PythonOperator
    python_callable: load_data_to_snowflake
    op_kwargs:
      file_path: '/tmp/transformed_file3.csv'
      table_name: 'snowflake_table_3'

  - task_id: email_notification
    operator: EmailOperator
    to: 'data_team@example.com'
    subject: 'S3 to Snowflake Data Pipeline Completed'
    html_content: 'The S3 to Snowflake pipeline has successfully loaded all data.'

  - task_id: end
    operator: BashOperator
    bash_command: 'echo "End of DAG"'

dependencies:
  - [start, extract_data_task1]
  - [start, extract_data_task2]
  - [start, extract_data_task3]

  - [extract_data_task1, transform_data_task1]
  - [extract_data_task2, transform_data_task2]
  - [extract_data_task3, transform_data_task3]

  - [transform_data_task1, load_data_to_snowflake_task1]
  - [transform_data_task2, load_data_to_snowflake_task2]
  - [transform_data_task3, load_data_to_snowflake_task3]

  - [load_data_to_snowflake_task1, email_notification]
  - [load_data_to_snowflake_task2, email_notification]
  - [load_data_to_snowflake_task3, email_notification]

  - [email_notification, end]`
  },
  bitshift: {
    simple: `start >> [check_source_A, check_source_B]

check_source_A >> process_source_A
check_source_B >> process_source_B

[process_source_A, process_source_B] >> consolidate_data

consolidate_data >> generate_report
generate_report >> end`,
    complex: `start >> [extract_data_A, extract_data_B, extract_data_C]

extract_data_A >> [transform_data_A, validate_data_A]
extract_data_B >> [transform_data_B, validate_data_B]
extract_data_C >> [transform_data_C, validate_data_C]

[transform_data_A, transform_data_B, transform_data_C] >> merge_data
[validate_data_A, validate_data_B, validate_data_C] >> generate_validation_report

merge_data >> [load_to_warehouse, generate_analytics]
generate_validation_report >> notify_data_quality

[load_to_warehouse, generate_analytics] >> update_metadata
notify_data_quality >> update_metadata

update_metadata >> end`
  }
}
