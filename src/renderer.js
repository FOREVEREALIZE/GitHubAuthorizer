const express  = require('express');
const https = require('https');
let app;
let tempCode;
let interval;
let output;

const clientIdInput = document.getElementById('client-id');
const clientSecretInput = document.getElementById('client-secret');
const button = document.getElementById('button');
const span = document.getElementById('span');

button.onclick = authenticateStep1;

function authenticateStep1() {
    const clientId = clientIdInput.value;

    const githubAuthorize = 'https://github.com/login/oauth/authorize?scope=repo,admin:repo_hook,admin:org,admin:public_key,admin:org_hook,gist,notifications,user,delete_repo,write:discussion,write:packages,read:packages,delete:packages,admin:gpg_key,codespace,workflow&client_id=';

    app = express();

    app.get('/authdone', function(req, res) {
        tempCode = req.query.code;
        res.send('<html lang="en"><head><script>window.close();</script><title>Byee!</title></head></html>');
    });

    app.listen(4973, function(){
        console.log("Server started on port: 4973")
    });

    window.open(githubAuthorize + clientId, '_blank');

    interval = setInterval(checkTempCode, 100);
}

function checkTempCode() {
    if (tempCode !== undefined) {
        clearInterval(interval);
        authenticateStep2();
    }
}

function authenticateStep2() {
    app = undefined;
    const clientId = clientIdInput.value;
    const clientSecret = clientSecretInput.value;
    console.log('Got code: ' + tempCode);

    const data = new TextEncoder().encode(
        JSON.stringify({
            "client_id": clientId,
            "client_secret": clientSecret,
            "code": tempCode
        })
    );

    const options = {
        hostname: 'github.com',
        port: 443,
        path: '/login/oauth/access_token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'Accept': 'application/json'
        }
    }

    const req = https.request(options, res => {
        res.on('data', d => {
            output = d.toString();
        });
    });


    req.on('error', error => {
        console.error(error)
    })

    req.write(data)
    req.end()

    interval = setInterval(checkOutput, 100);
}

function checkOutput() {
    if (output !== undefined) {
        clearInterval(interval);
        authenticateStep3();
    }
}

function authenticateStep3() {
    console.log('Got response: ' + output);
    span.innerHTML = 'Token is: ' + JSON.parse(output)['access_token'];
}