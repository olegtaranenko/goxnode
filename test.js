var x = {
  "result": "success",
  "return": {
    "hash": "1f27d1fc284143729944ab89823111d2bb63dc46",
    "pubkey": null,
    "balance": {
      "value": "0.00000000",
      "value_int": "0",
      "display": "0.00000000\u00a0BTC",
      "display_short": "0.00\u00a0BTC",
      "currency": "BTC"
    },
    "out": [{
      "n": "1",
      "value": {
        "value": "3.31674208",
        "value_int": "331674208",
        "display": "3.31674208\u00a0BTC",
        "display_short": "3.32\u00a0BTC",
        "currency": "BTC"
      },
      "script": "OP_DUP OP_HASH160 1f27d1fc284143729944ab89823111d2bb63dc46 OP_EQUALVERIFY OP_CHECKSIG",
      "addr": "1f27d1fc284143729944ab89823111d2bb63dc46",
      "claimed": "Y"
    }],
    "in": [{
      "n": "1",
      "prev_out_hash": "4462c88079cc51972f1bdcb8a4240ee8757b0bb69df828ade051c95ced540fa0",
      "prev_out_n": "1",
      "coinbase": null,
      "scriptsig": "30460221009e11350237ff2f15585295fd50b066bf5ac84c348cc851a5450fda80defee08b022100c6dfac609bf4e0d4bae466b7c0dde6c33d9c2a317ac19af3595485f2a649cb6201 042e3cb178cd19cad52a573db0406a9c372871f4dca825151a08a0d42a5ae943495471d908b2696760f2230e288918c1f97a8c25512fcff8c19b7554f6547f265b",
      "addr": "1f27d1fc284143729944ab89823111d2bb63dc46"
    }],
    "total_recv": {
      "value": "3.31674208",
      "value_int": "331674208",
      "display": "3.31674208\u00a0BTC",
      "display_short": "3.32\u00a0BTC",
      "currency": "BTC"
    }
  }
}


var call =  'z+jnNFc8TWC/wVOmoF8xxIO7glSyCNbfcmzPOUgA0wz39ld27UmvSmDhxGgKQxxWsG61vmTCBH2l/eiu6jFqYBkIPZXqW0BXc4jPIO+JLrJ7ImNhbGwiOiJwcml2YXRlXC9pbmZvIiwicGFyYW1zIjpbXSwiaXRlbSI6bnVsbCwiY3VycmVuY3kiOm51bGwsImlkIjoiNzEyYjQzYjA4OGU0M2Q1ZDc4NzBmNDY2ODU0M2I4ODQiLCJub25jZSI6IjEzNjI0NTQ1NjA5NDk2ODkifQ=='
var decoded = '%cf%e8%e7%34%57%3c%4d%60%bf%c1%53%a6%a0%5f%31%c4 %83%bb%82%54%b2%8%d6%df%72%6c%cf%39%48%0%d3%c%f7%f6%57%76%ed%49%af%4a%60%e1%c4%68%a%43%1c%56%b0%6e%b5%be%64%c2%4%7d%a5%fd%e8%ae%ea%31%6a%60%19%8%3d%95%ea%5b%40%57%73%88%cf%20%ef%89%2e%b2%7b%22%63%61%6c%6c%22%3a%22%70%72%69%76%61%74%65%5c%2f%69%6e%66%6f%22%2c%22%70%61%72%61%6d%73%22%3a%5b%5d%2c%22%69%74%65%6d%22%3a%6e%75%6c%6c%2c%22%63%75%72%72%65%6e%63%79%22%3a%6e%75%6c%6c%2c%22%69%64%22%3a%22%37%31%32%62%34%33%62%30%38%38%65%34%33%64%35%64%37%38%37%30%66%34%36%36%38%35%34%33%62%38%38%34%22%2c%22%6e%6f%6e%63%65%22%3a%22%31%33%36%32%34%35%34%35%36%30%39%34%39%36%38%39%22%7d';
var myhex   = '%cf%e8%e7%34%57%3c%4d%60%bf%c1%53%a6%a0%5f%31%c4 %4b%79%68%53%31%35%73%39%6d%50%48%4f%49%49%63%52%76%73%76%67%39%6f%57%73%57%43%75%34%35%59%4e%75%43%5a%50%55%79%4a%53%4e%46%39%56%2f%7a%41%71%51%4e%4e%4c%67%59%6d%52%45%47%6c%62%33%70%4d%6e%6f%41%30%65%49%72%7a%31%30%6f%5a%62%66%30%5a%4d%6f%34%45%6d%4b%52%41%3d%3d%7b%22%69%64%22%3a%22%33%32%34%33%30%61%65%34%63%30%63%65%66%63%36%31%38%61%32%63%31%64%64%39%66%39%39%66%39%39%36%39%22%2c%22%63%61%6c%6c%22%3a%22%70%72%69%76%61%74%65%2f%69%6e%66%6f%22%2c%22%6e%6f%6e%63%65%22%3a%22%31%33%36%32%34%36%31%31%31%39%30%38%32%30%30%22%2c%22%69%74%65%6d%22%3a%6e%75%6c%6c%2c%22%70%61%72%61%6d%73%22%3a%5b%5d%2c%22%63%75%72%72%65%6e%63%79%22%3a%6e%75%6c%6c%7d';
var query = '{"call":"private\/info","params":[],"item":null,"currency":null,"id":"712b43b088e43d5d7870f4668543b884","nonce":"1362454560949689"}';