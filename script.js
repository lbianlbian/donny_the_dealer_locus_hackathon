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
    let call = new XMLHttpRequest();
    call.open("POST", URL, false);
    let payload = {
        query: userInput
    };
    call.setRequestHeader("Content-Type", "application/json");
    call.send(JSON.stringify(payload));
    let resp = call.responseText;
    output.textContent = JSON.parse(resp).locusResp;
  }
  button.ontouchend = () => recognition.stop();
  recognition.onend = () => handleInput();

} else {
  document.getElementById('output').textContent = "Speech recognition not supported in this browser.";
}


// hold voice until text is recorded
// sent text to anthropic? to get it back in json form, action, name, amount
// call Locus with json response to move money