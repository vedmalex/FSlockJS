const {expect} = require('chai');
const FSLock = require('../FSLock');
const Job = require('../../src/Job/Job');
const Directory = require('../../src/Directory/Directory');

describe('FSQueue',  function suite() {
  this.timeout(10000);
  let queue, autoQueue, job;
  let path = './.fs.tests-fslock';
  let usersPath = path + '/users-' + Date.now();
  it('should initialize', function () {
    queue = new FSLock({autoexec: false})
    expect(queue.queue).to.deep.equal([]);
    expect(queue.options.autoexec).to.equal(false);
  });
  it('should create a command and return a job element', async function () {
    const addedJob = await queue.add('Directory.exists', usersPath);
    expect(addedJob.constructor.name).to.equal(Job.name);
    expect(addedJob.state).to.equal('queued');
    expect(queue.queue.length).to.equal(1);
    expect(queue.queue).to.deep.equal([addedJob]);
  });
  it('should get a job from queue', function () {
    job = queue.get();
    expect(job.command).to.equal('Directory.exists');
    expect(job.state).to.equal('queued');
  });
  it('should process a command and mutate job element', async function () {
    const job2 = await queue.add('Directory.create', usersPath);

    await queue.processNext();
    expect(job.state).to.equal('executed');
    expect(job.result).to.equal(false);

    await queue.processNext();
    expect(job2.state).to.equal('executed');
    expect(job2.result).to.equal(true);

    const job3 = await queue.add('Directory.exists', usersPath);
    await queue.processNext();
    expect(job3.state).to.equal('executed');
    expect(job3.result).to.equal(true);
  });
  it('should works with file - SBTree work case', async function () {
    const doc = {"_id": "5d6d4123117055fa0b17bb15", "email": "jean@valjean.fr", "age": 27}
    const {_id, email, age} = doc;

    const createJob = await queue.add('File.create', `${usersPath}/${doc._id}.json`, Object.assign({}, {_id, email}));
    const readJob = await queue.add('File.read', `${usersPath}/${doc._id}.json`);

    // We process
    await queue.processNext();
    await queue.processNext();

    //Queue is empty, file is existing now, let's read it.

    const storeDoc = readJob.result;
    expect(storeDoc).to.deep.equal(Object.assign({}, {_id, email}));

    const updateJob = await queue.add('File.create', `${usersPath}/${doc._id}.json`, Object.assign({}, storeDoc, {age}))
    await queue.processNext();

    const verifyJob = await queue.add('File.read', `${usersPath}/${doc._id}.json`);
    await queue.processNext();

    expect(verifyJob.result).to.deep.equal(doc);
  });
  it('should have job emitting a event when ready', async function () {
    const doc = {"_id": "5d6d4123117055fa0b17bb16", "email": "alex@valjean.fr", "age": 27}

    await queue.add('File.create', `${usersPath}/${doc._id}.json`, doc)
    const readJob = await queue.add('File.read', `${usersPath}/${doc._id}.json`);
    return new Promise(async (res, rej)=>{
      readJob.on('executed', () => {
        expect(readJob.state).to.deep.equal('executed');
        expect(readJob.result).to.deep.equal(doc);
        res(true);
      })

      await queue.processAll();
    })


  });
  it('should allow await of execution of a job', async function () {
    const doc = {"_id": "5d6d4123117055fa0b17bb17", "email": "victor@valjean.fr", "age": 20}
    autoQueue = new FSLock();

    await autoQueue.add('File.create', `${usersPath}/${doc._id}.json`, doc)
    const readJob = await autoQueue.add('File.read', `${usersPath}/${doc._id}.json`);

    await readJob.execution();

    expect(readJob.state).to.deep.equal('executed');
    expect(readJob.result).to.deep.equal(doc);

    autoQueue.stop()
  });
  after('clean up mess', async () => {
    const ensuredPath = `./.fs.tests-fslock`;

    await Directory.remove(ensuredPath, true);
  });
});
