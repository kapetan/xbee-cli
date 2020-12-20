# xbee-cli

Command line tools to ease development with XBee devices. The CLI exposes commands for interacting with the file system on the XBee through a serial port connection.

    npm install -g xbee-cli

## Usage

Run `xbee [command] --help` for more details about each command.

```
xbee [command]

Commands:
  xbee cp <source> <target>  Copy source file to target
  xbee ls <source>           List files in source directory
  xbee rm <source>           Remove source file or empty directory
  xbee tail <path>           Tail serial output from device

Options:
  --help     Show help                                                              [boolean]
  --version  Show version number                                                    [boolean]
```

For example to copy a local file to a XBee device.

```sh
xbee cp test.txt /dev/tty.usbserial:/flash/test.txt
```

Note the serial port path is specified as a prefix to the file on the XBee device (separated by colon). The serial port path is typically on the form `/dev/tty.XXX` for macOS and Linux and `COM1` for Windows.
