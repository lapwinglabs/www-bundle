/**
 * Module Dependencies
 */

var React = require('react')
var uid = require('uid')

/**
 * Title Component
 */

export default class Title extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    return (
      <h2>My favorite unique ID is: {uid(8)}!</h2>
    )
  }
}
