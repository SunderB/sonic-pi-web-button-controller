//let sonicPiSampleBoard;

const http      = require('http');
const fs        = require('fs');
const osc       = require('node-osc');
const path      = require('path');
const jsonfile  = require('jsonfile');
const url = require('url');

const SonicPiClient = require("./spi-client.js");

var host = "192.168.1.7"
var port = 8080

var settings = {
  "commands": {
    0: "play :c",
    1: "play :d",
    2: "play :e",
    3: "play :f",
    4: "play :g",
    5: "play :a",
    6: "play :b",
    7: "sample :amen_loop",
    8: "",
    9: "",
    10: "",
    11: "",
    12: "",
    13: "",
    14: "",
    15: "stop"
  },
  // Allows users to modify the button commands on the webpage
  "allow_online_command_modification": true
}


if (settings["allow_online_command_modification"]) {
  console.warn("Online command modification is enabled\nThis can make your system vunerable to arbitary code execution.\nUse this with caution!");
}

var spi_client = new SonicPiClient();

function requestListener(req, res) {
  console.log("Incoming request")
  console.log(req)

  var req_url = url.parse(req.url);

  switch (req_url.pathname) {
    case "/html/main.css":
      // So that the stylesheet loads on the main page
      fs.readFile(__dirname + "/../html/main.css", 'utf8', function (err,data) {
        if (err) {
         return console.log(err);
        }
        //console.log(data);
        res.writeHead(200, {'Content-Type': 'text/css'});
        res.write(data);
        return res.end();
      });
      break;
    default:
      fs.readFile(__dirname + "/../html/main.html", 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        //console.log(data);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
      });
  }

}

server = http.createServer(requestListener);

const io = require("socket.io")(server);

io.on("connection", (socket) => {
  console.log(`[${socket.id}]: Connected`);
  // Send the server settings
  socket.emit("set_settings", settings);

  socket.on("button_pressed", (id) => {
    console.log(`[${socket.id}]: run-code request recieved`)
    console.log(id);
    spi_client.send("/run-code", "nodejs", settings["commands"][id]);
  });

  socket.on("set_settings", (recieved_settings) => {
    if (settings["allow_online_command_modification"]) {
      console.log(`[${socket.id}]: Settings recieved:`);
      settings = recieved_settings;
      console.log(recieved_settings)
    }
  });
});

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

  // play(selector) {
  //   const editor = atom.workspace.getActiveTextEditor();
  //   if (editor === undefined) {
  //     return atom.notifications.addError("No active text editor found.");
  //   } else {
  //     const source = editor[selector]();
  //     this.send('/run-code', 'atom', source);
  //     return atom.notifications.addSuccess("Sent source code to Sonic Pi.");
  //   }
  // },
  //
  // saveAndPlay() {
  //   const _this = this;
  //   const editor = atom.workspace.getActiveTextEditor();
  //   const fullPath = "";
  //   if (editor === undefined) {
  //     return atom.notifications.addError("No active text editor found.");
  //   } else {
  //     let saved;
  //     if (editor.getPath() === undefined) {
  //       const filepath = electron.dialog.showSaveDialog({
  //         title: "Sonic Pi: Save As and Play File",
  //         filters: [
  //           {name: "Ruby file", extensions: ["rb"]},
  //           {name: "Text file", extensions: ["txt"]},
  //           {name: "All files", extensions: ["*"]}
  //         ]
  //         });
  //       if (filepath === undefined) {
  //         // User has exited, return
  //         return;
  //       } else {
  //         saved = editor.saveAs(filepath);
  //         return saved.then(
  //           function(result) {
  //             console.log(result); // Stuff worked!
  //             const filePath = filepath.replace(/\\/g,"/");
  //             console.log(filePath);
  //             _this.send('/run-code', 'atom', `run_file "${filePath}"`);
  //             return atom.notifications.addSuccess("Saved file and told Sonic Pi to start playing.");
  //           },
  //           function(error) {
  //             console.log(error); // It broke
  //             return atom.notifications.addError(`Error when saving file: ${error}, try saving it using File > Save instead`);
  //         });
  //       }
  //
  //     } else {
  //       saved = editor.save();
  //       return saved.then(
  //         function(result) {
  //           console.log(result); // Stuff worked!
  //           const filePath = editor.getPath().replace(/\\/g,"/");
  //           console.log(filePath);
  //           _this.send('/run-code', 'atom', `run_file "${filePath}"`);
  //           return atom.notifications.addSuccess("Saved file and told Sonic Pi to start playing.");
  //         },
  //         function(error) {
  //           console.log(error); // It broke
  //           return atom.notifications.addError(`Error when saving file: ${error}, try saving it using File > Save instead`);
  //         }
  //       );
  //     }
  //   }
  // },
  //
  // stop() {
  //   this.send('/stop-all-jobs');
  //   return atom.notifications.addInfo("Told Sonic Pi to stop playing.");
  // },
  //
  // send(...args) {
  //   // Get IP addresses and ports
  //   const sp_server_ip = atom.config.get('sb-atom-sonic-pi.sonicPiServerIP');     // default: 127.0.0.1
  //   const sp_server_port = atom.config.get('sb-atom-sonic-pi.sonicPiServerPort'); // default: 4557
  //
  //   const sp_gui_ip = atom.config.get('sb-atom-sonic-pi.sonicPiGUIIP');           // default: 127.0.0.1
  //   const sp_gui_port = atom.config.get('sb-atom-sonic-pi.sonicPiGUIPort');       // default: 4559
  //
  //   // Send OSC messages
  //   if (atom.config.get('sb-atom-sonic-pi.sendOSCMessagesToGUI') === true) {
  //     const sp_gui = new osc.Client(sp_gui_ip, sp_gui_port);
  //     sp_gui.send(...(args), () => sp_gui.kill());
  //   }
  //   const sp_server = new osc.Client(sp_server_ip, sp_server_port);
  //   return sp_server.send(...(args), () => sp_server.kill());
  // },
  //
  // test_toggle() {
  //   console.log('sb-atom-sonic-pi: test_toggle was activated!');
  //   if (this.modalPanel.isVisible()) {
  //     console.log('sb-atom-sonic-pi: hiding panel');
  //     return this.modalPanel.hide();
  //   } else {
  //     console.log('sb-atom-sonic-pi: showing panel');
  //     return this.modalPanel.show();
  //   }
  // }
//});
