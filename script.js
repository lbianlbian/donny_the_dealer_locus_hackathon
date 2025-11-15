const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//const URL = "https://script.google.com/macros/s/AKfycbyQ-qPC73IPuSlrv6uh5ajDFYeuELM5R_GxG7TseKQ5p9M8xIH1JwG8I4jvmYW11oeX/exec"
const URL = "http://localhost:3000/api/action";

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.interimResults = true;
  recognition.continuous = false;
  const output = document.getElementById('output');
  let userInput = "";

  recognition.onresult = event => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    output.textContent = transcript;
    userInput = transcript;
  };

  const button = document.getElementById('holdToTalkBtn');
  button.onmousedown = () => recognition.start();
  button.onmouseup = () => recognition.stop();
  button.ontouchstart = () => recognition.start();  // mobile support
  
  function handleInput(){
    output.textContent = "Message received, processing ...";
    let call = new XMLHttpRequest();
    call.open("POST", URL); // async by default

    call.setRequestHeader("Content-Type", "application/json");

    call.onload = () => {
        if (call.status >= 200 && call.status < 300) {
            let resp = JSON.parse(call.responseText);
            output.textContent = resp.locusResp;
        } else {
            output.textContent = 'Error: ' + call.statusText;
        }
    };

    call.onerror = () => {
        output.textContent = 'Network error occurred';
    };

    call.send(JSON.stringify({ query: userInput }));
    }

  button.ontouchend = () => recognition.stop();
  recognition.onend = () => handleInput();

} else {
  document.getElementById('output').textContent = "Speech recognition not supported in this browser.";
}
