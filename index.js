const { pipeline } = require('stream')
const { promisify } = require('util')
const { once } = require('events')
const { createReadStream, createWriteStream } = require('fs')
const { stat, rm } = require('fs/promises')
const SerialPort = require('serialport')
const DeviceStream = require('xbee-serial-stream')

const BAUD_RATE = 9600
const noop = () => {}

function parse (file, def = 'path') {
  if (typeof file === 'string') {
    // TODO filename contains colon
    const [device, path] = file.split(':')
    return path ? { device, path } : { [def]: device }
  }

  return file
}

async function copy (source, target) {
  source = parse(source)
  target = parse(target)

  const ports = []
  let read, write, length

  if (source.device) {
    const device = new DeviceStream()
    const port = new SerialPort(source.device, { baudRate: BAUD_RATE })
    pipeline(device, port, device, noop)
    ports.push(port)
    read = device.createReadStream(source.path)
    length = once(read, 'file').then(file => file.length)
  } else {
    read = createReadStream(source.path)
    length = stat(source.path).then(stats => stats.size)
  }

  if (target.device) {
    const device = new DeviceStream()
    const port = new SerialPort(target.device, { baudRate: BAUD_RATE })
    pipeline(device, port, device, noop)
    ports.push(port)
    write = device.createWriteStream(target.path, await length)
  } else {
    write = createWriteStream(target.path)
  }

  await promisify(pipeline)(read, write)
  ports.forEach(port => port.destroy())
}

async function list (source) {
  source = parse(source, 'device')
  const path = source.path ? (' ' + source.path) : ''

  const device = new DeviceStream()
  const port = new SerialPort(source.device, { baudRate: BAUD_RATE })
  const pipe = promisify(pipeline)(device, port, device)
  const ls = await device.command('FS LS' + path, null, '')
  port.destroy()

  try {
    await pipe
  } catch (err) {}

  return ls
}

async function remove (source) {
  source = parse(source)

  if (source.device) {
    const device = new DeviceStream()
    const port = new SerialPort(source.device, { baudRate: BAUD_RATE })
    const pipe = promisify(pipeline)(device, port, device)
    await device.command('FS RM ' + source.path)
    port.destroy()

    try {
      await pipe
    } catch (err) {}
  } else {
    await rm(source.path)
  }
}

async function tail (path) {
  const port = new SerialPort(path, { baudRate: BAUD_RATE })
  await promisify(pipeline)(port, process.stdout)
}

exports.copy = copy
exports.list = list
exports.tail = tail
exports.remove = remove
