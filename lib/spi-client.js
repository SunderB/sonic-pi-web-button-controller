let sonicPiClient;

const http      = require('http');
const fs        = require('fs');
const osc       = require('node-osc');
const path      = require('path');
const jsonfile  = require('jsonfile');

module.exports = class SonicPiClient {
  constructor(_sp_server_ip="127.0.0.1", _sp_server_port=51235, _sp_client_port=51236) {
    this.sp_server_ip = _sp_server_ip;
    this.sp_server_port = _sp_server_port;
    this.sp_client_port = _sp_client_port;
  }

  send(...args) {
    // Send OSC messages
    //if (atom.config.get('sb-atom-sonic-pi.sendOSCMessagesToGUI') === true) {
    //  const sp_gui = new osc.Client(sp_gui_ip, sp_gui_port);
    //  sp_gui.send(...(args), () => sp_gui.kill());
    //}
    const sp_server = new osc.Client(this.sp_server_ip, this.sp_server_port);
    return sp_server.send(...(args), () => sp_server.kill());
  }


}
