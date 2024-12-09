const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = './plugin.proto';
const OPTIONS = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

const packageDefinition = protoLoader.loadSync(PROTO_PATH, OPTIONS);
const counterProto = grpc.loadPackageDefinition(packageDefinition).Counter;

function manipulateCounter(call, callback) {
    const currentValue = call.request.currentValue;
    const newValue = currentValue + 2; // Logic: Add 2
    console.log(`Manipulating counter: ${currentValue} + 2 = ${newValue}`); //debug fro gRPC
    callback(null, { newValue });
}

const server = new grpc.Server();
server.addService(counterProto.service, { manipulateCounter });

const PORT = process.env.PLUGIN_PORT || 50051;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`gRPC Plugin Server running at http://0.0.0.0:${PORT}`);
    server.start();
});
