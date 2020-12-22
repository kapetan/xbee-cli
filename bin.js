#!/usr/bin/env node

const yargs = require('yargs/yargs')
const { terminalWidth } = require('yargs')
const { hideBin } = require('yargs/helpers')
const xbee = require('.')

yargs(hideBin(process.argv))
  .command('cp <source> <target>', 'Copy source file to target',
    yargs =>
      yargs
        .positional('source', {
          describe: 'Source file with optional serial port path'
        })
        .positional('target', {
          describe: 'Target file with optional serial port path'
        })
        .example('$0 cp test.txt /dev/tty.usbserial:/flash/test.txt', 'Copy local file to device')
        .example('$0 cp /dev/tty.usbserial:/flash/test.txt test.txt', 'Copy file from device to local computer'),
    argv => xbee.copy(argv.source, argv.target))
  .command('ls <source>', 'List files in source directory',
    yargs =>
      yargs
        .positional('source', {
          describe: 'Serial port path with optional source directory'
        })
        .example('$0 ls /dev/tty.usbserial:/flash', 'List files in device\'s flash directory'),
    argv =>
      xbee.list(argv.source)
        .then(list =>
          list.forEach(item => console.log(item))))
  .command('rm <source>', 'Remove source file or empty directory',
    yargs =>
      yargs
        .positional('source', {
          describe: 'Source file with optional serial port path'
        })
        .example('$0 rm /dev/tty.usbserial:/flash/test.txt', 'Remove file on device'),
    argv =>
      xbee.remove(argv.source))
  .command('at <path> <cmd>', 'Execute AT command on device',
    yargs =>
      yargs
        .positional('path', {
          describe: 'Serial port path'
        })
        .positional('cmd', {
          describe: 'AT command to execute'
        })
        .option('terminator', {
          description: 'Terminator condition for the command response'
        })
        .example('$0 at /dev/tty.usbserial SH', 'Get value for SH (serial number high)')
        .example('$0 at /dev/tty.usbserial "FS LS" --terminator ""', 'List files on device'),
    argv =>
      xbee.command(argv.path, argv.cmd, argv.terminator)
        .then(result =>
          result.forEach(item => console.log(item))))
  .command('tail <path>', 'Tail serial output from device',
    yargs =>
      yargs
        .positional('path', {
          describe: 'Serial port path'
        })
        .example('$0 tail /dev/tty.usbserial', 'Tail output'),
    argv => xbee.tail(argv.path))
  .wrap(Math.min(120, terminalWidth()))
  .parse()
