/* Regras do programa:
* 1. Voce possue um array com 50 posicoes chamado `load`, que sao funcoes assincronas que
   simulam uma carga de trabalho, atraves de um delay ,for each Delay on load function I mean 
* 2. my throttle should: Voce deve executar TODAS as cargas de trabalho (nenhuma deve deixar de ser executada)
* 3. Cada worker (posicoes de execucao em paralelo) so deve executar uma tarefa por vez
* 4. Voce deve otimizar ao maximo, para que os workers nao fiquem parados (esperando o outro processar)
*
*/

import 'dotenv/config';
import debug from 'debug';
const logger = debug('core');

// Generate random delays for each worker
const delays = [...Array(50)].map(() => Math.floor(Math.random() * 900) + 100);

// this Create an array of asynchronous functions simulating a workload attached to current working load a delay
const load: (() => Promise<number>)[] = delays.map(
  (delay) => (): Promise<number> =>
    new Promise((resolve) => {
      setTimeout(() => resolve(Math.floor(delay / 100)), delay);
    })
);

//type for each task 
type Task = () => Promise<number>;

//Throttle function to control the execution of tasks

const throttle = async (workers: number, tasks: Task[]) => {
  const cacheTask: number[] = [];
  const queueTaks: Task[] = [...tasks];
  const runningTasks: Promise<void>[] = [];

const execTask = async (task: Task) => {
    const tasktToExec = await task(); // current task to run later
    cacheTask.push(tasktToExec); // Store current task in this cache
    
    //recursively collect task if still have taks
    if (queueTaks.length > 0) {
        //next task to execute
        const nextTaskToExc = queueTaks.shift()!;
        await execTask(nextTaskToExc);
    } 
  };
  
  // Start workers having work size and take into account the queue size of remaining workers

  for (let i = 0; i < workers && i < queueTaks.length; i++) {
    const task = queueTaks.shift()!;
    const promise = execTask(task);
    runningTasks.push(promise); // Track runningTasks workers
  }
  // since we are adding all workers to runningTasks , thus we can run it awaiting
  await Promise.all(runningTasks);  
  return cacheTask;
};

// Bootstrap function to start the program
const bootstrap = async () => {
  logger('Starting...');
  const start = Date.now();
  //five workers, expect to run all loads(async working load = 50)
  const answers = await throttle(5, load);
// test  const answers = await throttle(5, [()=>new Promise( (resolve)=>setTimeout(Math.floor(delay / 100)),1000)]);
// test const answers = await throttle(5, []);
  logger('Done in %dms', Date.now() - start);
  logger('Answers: %O', answers);
};

// Call bootstrap function and handle errors
bootstrap().catch((err) => {
  logger('General fail: %O', err);
});

bootstrap().then()