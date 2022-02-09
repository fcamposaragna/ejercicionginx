const cant = process.argv[2]
let min = 1
let max = 1000
let randoms = {}

for (let i = 1; i<= cant; i++){
    let num = Math.floor(Math.random() * (max - min)) + min;
    //let num = Math.floor(Math.random() * 1000) + 1
    if(randoms[num]){
        randoms[num] += 1
    }else{
        randoms[num] = 1
    }
}

process.send(randoms)