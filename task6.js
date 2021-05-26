// Задание №6

// Ситуация №1:
// 1.  button.addEventListener('click', () => {
// 2.    Promise.resolve().then(() => console.log('Microtask 1'));
// 3.    console.log('Listener 1');
// 4.  });
// 5.  
// 6.  button.addEventListener('click', () => {
// 7.    Promise.resolve().then(() => console.log('Microtask 2'));
// 8.    console.log('Listener 2');
// 9.  });

/* 

Ответ: в консоле мы видим  Listener1 => Microtask 1 => Listener2 => Microtask 2. Как же это работает под капотом?


Этап 0: Состояние до клика
DOM сформирован, Listener добавлен в WepApi и ожидает клика пользователя, страница отрисована. 
Колстек пустой, очереди макротасков и микротаксов пустые.

Состояние:
callstack: empty
macrotasks queue: empty
microtasks queue: empty
console: empty


Этап 1: Обработка первого события.
Пользователь делает клик на кнопке. 

EventLoop из WebApi добавляет в macrotasks queue 2 анонимные функции, microtasks queue при этом пока пустая, 
соответственно в callstack попадает 1-ая анонимная функция (anonymous1) и начинается её выполнение. Происходит 
регистрация микротаска для промиса1 (анонимная функция) и добавляется в callstack функция console.log(Listener1) - 
так как это синхронный код, отрабатывается, выводит в консоль сообщение Listener1 и сразу умирает, так как с стеке 
находится еще наш первый обработчик то продолжается его отработка и если бы были еще какие-то синхронные опирации 
они продолжили бы свои выполнения. 

Но так как синхронных операций больше нет, то anonymous1 удаляется из стека, стек становится пустым и продолжают 
выполняться наши макро- и микро- таски из очередей. У микротасков приоритет больше и выполняется наш промис - 
анонимная функция из microtasks queue попадает в коллстек (даже не смотря на то,что в очереди macrotasks до сих
пор висит anonymous2 с обработчика onclick). 

Если бы в теле помимо промиса и синхронного консоль-лога(Listener1) были еще макрозадачи (например setTimeout),
 то они выполненились бы после выполнения двух главных анонимных функций (которые были добавлены в очеред 
	макротасков после клика), очередь makrotasks выглядела бы в стиле: anonymous1, anonymous2, setTimeout1, setTimeout2. 

А на экране мы бы видели:
Listener 1
Microtask 1
Listener 2
Microtask 2
timeout1
timeout2

Потому что задачи из macrotasks queue выполняются по одной и перед каждым выполнением проверяется "а что там в microtasks queue 
и пуст ли наш callstack"

Состояние :
callstack: empty => anonymous1 => anonymous1 + console.log('Listener1') => anonymous1 => empty => 
anonymous(из микрозадач) + console.log('Microtask 1') => empty
macrotasks queue: empty => anonymous1, anonymous2 => anonymous2
microtasks queue: empty => promise1 => empty
console: Listener1, Microtask 1



Этап2: Обработка второго клика
Не стану расписывать, чтобы не терялось время на чтение, по сути процесс аналогичен первому. В macrotasks выполнился первый обработчик, но все еще висит второй и начинается его исполнение => обработка синхронного кода из второй анонимной функции => обработка микротасков => дальнейшая обработка макростасков если они есть => очистка коллстека и очередей

Состояние:
callstack: empty => anonymous2 => anonymous2 + console.log('Listener2') => anonymous1 => empty => console.log('Microtask 2') => empty
macrotasks queue: anonymous2 => empty
microtasks queue: empty => promise2 => empty
console: Listener1, Microtask 1, Listener2, Microtask 2




*/

// Ситуация №2:
// 1.    button.addEventListener('click', () => {
// 2.      Promise.resolve().then(() => console.log('Microtask 1'));
// 3.      console.log('Listener 1');
// 4.    });
// 5.    
// 6.    button.addEventListener('click', () => {
// 7.      Promise.resolve().then(() => console.log('Microtask 2'));
// 8.      console.log('Listener 2');
// 9.    });
// 10.  
// 11. button.click();

/*

Ответ: в консоле мы видим  Listener1 => Listener2 => Microtask1  => Microtask2

Почему же у нас отличается результат в консоле? А потому что в первом случае после клика в очереди macrotasks queue мы имели две отдельный задачи, соответственно когда код из первой выполнялся, eventloop перед выполнением второй мог посмотреть на очереди макро- и микро- тасков и выбрать что ему выполнить. Во втором же примере в callstack попадает функция button.click(). Далее вызывается код из первого обработчика, выполняет синхронный код из него, добавляются новые задачи в макро- и микро- очереди. И что важно в callstack'е до сих пор висит button.click(). Соответственно (eventloop не проверяет что ему выбрать макро- или микро- ведь коллстек не пуст) вызывается код из второго обработчика и исполняется его синхронный код (+ добавление в очереди каких-то задач). И только после того как весь синхронный код выполнен, стек очищается, event loop может заглянуть в макро- и микро- очереди и посмотреть что в них. Если там есть микро-задачи, он выполнит в первую очередь их и затем перейдет к макро задачам. То есть если бы в теле двух обработчиков были какие-то макро-таски (например сет-таймауты, даже с 0ms "хотя по факту там 4+ ms"), то они выполнились бы после наших промиссов, например:
Listener 1
Listener 2
Microtask 1
Microtask 2
timeout1
timeout2

*/

