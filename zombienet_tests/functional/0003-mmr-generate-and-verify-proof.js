async function run(_, networkInfo, nodeNames) {
  const apis = await Promise.all(
    nodeNames.map(async (nodeName) => {
      const { wsUri, userDefinedTypes } = networkInfo.nodesByName[nodeName];
      return await zombie.connect(wsUri, userDefinedTypes);
    })
  );

  // generate proof on arbitrary node
  const proof = await apis[Math.floor(Math.random(0, apis.length - 1))].rpc.mmr.generateProof([1, 9, 20]);

  const root = await apis[Math.floor(Math.random(0, apis.length - 1))].rpc.mmr.root()

  const proofVerifications = await Promise.all(
    apis.map(async (api) => {
      return api.rpc.mmr.verifyProof(proof);
    })
  );

  const proofVerificationsStateless = await Promise.all(
    apis.map(async (api) => {
      return api.rpc.mmr.verifyProofStateless(root, proof);
    })
  );

  // check that all nodes accepted the proof
  return proofVerifications.every((proofVerification) => proofVerification) && proofVerificationsStateless.every((proofVerification) => proofVerification)
}

module.exports = { run };
