// Libraries
const mineflayer = require('mineflayer');
const firebase = require('firebase/app');
const { getDatabase, ref, onValue } = require('firebase/database');
const { exec } = require("child_process");
const fs = require('fs')

// Configs
const firebaseConfig = {
  apiKey: 'AIzaSyCVfTM1bRoURTPLiQGsd3CgLkNDwItsUC4',
  authDomain: 'bot-smcdatabase.firebaseapp.com',
  projectId: 'bot-smcdatabase',
  storageBucket: 'bot-smcdatabase.appspot.com',
  messagingSenderId: '906528286834',
  appId: '1:906528286834:web:152414ead69f88453f3aeb',
  measurementId: 'G-R8GHYY9J2W'
}


// Variables
const app = firebase.initializeApp(firebaseConfig);
const db = getDatabase(app);
let botList = [];

let lastNumber = 0

function readData() {
  let mobject = JSON.parse(fs.readFileSync('accounts.json'));

  if (lastNumber <= Object.keys(mobject).length) {
    lastNumber += 1;
    return mobject[lastNumber];
  } else {
    lastNumber = 0;
    return mobject[lastNumber];
  }

}

var i = 1;                  //  set your counter to 1

function myLoop(username, password, DebugMode) {         //  create a loop function
  setTimeout(function() {   //  call a 3s setTimeout when the loop is called
    //  your code here
    createBot(username, password, DebugMode);
    i++;                    //  increment the counter
    //  if the counter < 10, call the loop function

    myLoop(username, password, DebugMode);
    //  ..  again which will trigger another 
    //  ..  setTimeout()
  }, 5000)
}



// Database reader
onValue(ref(db, 'config/'), (snapshot) => {
  const data = snapshot.val();
  const { botsAmount, enabled, password, teleportNick, DebugMode } = data;
  const username = teleportNick;

  if (enabled == 1) {
    if (DebugMode == 1) { console.log('[#] All bots are Enabled.'); }
    createBot(username, password, DebugMode);
    myLoop(username, password, DebugMode);



  } else {
    if (DebugMode == 1) { console.log('[#] All bots are Disabled.'); }
    for (let i = 0; i < botList.length; i++) {
      botList[i].quit();
    }
  }
});


// Functions
function randomName(minLength, maxLength) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = '';
  const nameLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

  for (let i = 0; i < nameLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function createBot(username, password, DebugMode) {
  var botName = readData()
  const bob = mineflayer.createBot({
    host: 'anarchia.gg',
    username: botName,
  })
  botList.push(bob)

  bob.once('login', () => {
    if (DebugMode == 1) { console.log(`[^] ${botName} joined to the server`) }
  })

  bob.on('message', (message) => {
    if (message.extra) {
      const chatMessage = message.toString()

      if (chatMessage.includes('/register')) {
        const code = chatMessage.match(/\d+/g).join('')
        setTimeout(() => {
          bob.chat(`/register ${password} ${password} ${code}`);
          joinAnarchiaSMP();
        }, 1000);
      } else if (chatMessage.includes('/login')) {
        setTimeout(() => {
          bob.chat(`/login ${password}`);
          joinAnarchiaSMP();
        }, 1000);
      }
    }
  });

  function joinAnarchiaSMP() {

    if (bob.inventory.items().length > 0) {
      bob.on('message', (message) => {

        if (message.extra) {
          const chatMessage = message.toString()
          if (chatMessage.includes('Konto zostało pomyślnie zweryfikowane!')) {
            setTimeout(() => {
              bob.setQuickBarSlot(4)
              bob.activateItem()
              bob.once('windowOpen', () => {
                setTimeout(() => {
                  if (DebugMode == 1) { console.log(`[^] ${botName} entered to AnarchiaSMP`) }
                  bob.clickWindow(1, 0, 0)
                  afterLogin()
                }, 1000);
              })
            }, 1000);
          }
        }
      });
    } else {
      setTimeout(joinAnarchiaSMP, 1000)
    }
  }

  function afterLogin() {
    setTimeout(() => {
      if (DebugMode == 1) { console.log(`[>] ${botName} asking for teleport`) }
      bob.chat(`/tpa ${username}`)

      bob.on('death', () => {
        if (DebugMode == 1) { console.log(`[*] ${botName} died`) }
        bob.end()
        createBot(username, password, DebugMode)
      })
    }, 8000);
  }

  bob.once('error', (err) => {
    if (DebugMode == 1) { console.log(`${botName} catched an error: ${err.message}`) }
    bob.end()
    createBot(username, password, DebugMode)
  })
  bob.once('kicked', (message) => {
    if (DebugMode == 1) { console.log(`${botName} got kicked: ${message}`) }


    bob.end()
    createBot(username, password, DebugMode)
  })
}
