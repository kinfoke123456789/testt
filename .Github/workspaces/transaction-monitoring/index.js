
require('dotenv').config();
const express = require('express');
const WebSocket = require('ws');
const { ethers } = require('ethers');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// WebSocket Server for Real-Time Updates
const wss = new WebSocket.Server({ noServer: true });
const provider = new ethers.providers.InfuraWebSocketProvider("mainnet", process.env.INFURA_API_KEY);

let monitoredAddresses = [];

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const { action, address } = JSON.parse(message);
        if (action === "add" && !monitoredAddresses.includes(address)) {
            monitoredAddresses.push(address);
        }
    });
});

provider.on("block", async () => {
    for (const address of monitoredAddresses) {
        const balance = await provider.getBalance(address);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    from: address,
                    value: ethers.utils.formatEther(balance)
                }));
            }
        });
    }
});

const server = app.listen(4000, () => {
    console.log("Backend running on port 4000");
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
