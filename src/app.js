const express = require('express');
const minimist = require('minimist');
const cluster = require('cluster');
const core = require('os');
const handlebars = require('express-handlebars');
const engine = handlebars.engine;
const fork = require('child_process').fork;
const app = express();
const args = minimist(process.argv.slice(2));
const PORT = args.port || 8080;
const mode = args.modo || "fork";

app.use(express.static(__dirname + '/public'))
app.engine('handlebars', engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')

if(mode === "cluster"){
    if(cluster.isPrimary){
        console.log(`Proceso primario con pid ${process.pid}`)
        for(let i=0;i<core.cpus().length;i++){
            cluster.fork()
        }
        cluster.on('exit',(worker, code, signal)=>{
            console.log(`Worker ${worker.process.pid} caído`);
            cluster.fork();
            console.log(`Worker restaurado`)
        })
    }else{
        console.log(`Worker ${process.pid}`)
        app.listen(PORT,()=>console.log(`Worker ${process.pid} en el puerto ${PORT}`));
    }
    
}else{
    app.listen(PORT,()=>console.log(`Escuchando en modo fork en puerto ${PORT}`))
}

app.get('/api/randoms',(req,res)=>{
    const cant = req.query.cant || 100_000_000
    const child = fork('randoms.js', [cant])
    child.on('message',(data=>{
        console.log(data)
        res.send({message:`PORT: ${PORT} con PID ${process.pid}`, payload:data})
    }))
})

app.get('/info', (req, res)=>{
    let preparedObject ={
        arguments: process.argv.slice(2),
        system : process.platform,
        version: process.version,
        process: process.pid,
        memory : JSON.stringify(process.memoryUsage()),
        pathEjection: process.argv[1],
        procesadores: core.cpus().length,
        carp :process.cwd
    }
    res.render('info', preparedObject)
})