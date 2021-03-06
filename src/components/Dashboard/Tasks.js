import React, { Component } from 'react';
import $ from "jquery";
import { Col, Row } from 'react-bootstrap';
import Firebase from '../../Firebase';

const groupRef = Firebase.database().ref('/groups');

class Tasks extends Component {
  state = {
    open: null,
    description: ''
  }
  open(id){
    if(this.state.open){
      this.setState({open: null})
    } else {
      this.setState({open: id})
    }
  }
  onSelect(id){
    groupRef.child(this.props.groupId).child(this.props.section).child(this.state.open).child('owner').set(id);
    this.setState({open: null})
  }
  handleChange(e){
    this.setState({description: e.target.value});
  }
  saveDescription(description, taskId){
    groupRef.child(this.props.groupId).child(this.props.section).child(taskId).child('description').set(description);
  }
  changeStatus(status, name, id){
    if(status === ""){
      groupRef.child(this.props.groupId).child(this.props.section).child(id).child('stages').child(name).set('red');
    } else if(status === "red"){
      groupRef.child(this.props.groupId).child(this.props.section).child(id).child('stages').child(name).set('yellow');
    } else if(status === "yellow"){
      groupRef.child(this.props.groupId).child(this.props.section).child(id).child('stages').child(name).set('green');
    } else {
      groupRef.child(this.props.groupId).child(this.props.section).child(id).child('stages').child(name).set('');
    }
  }
  delete(id){
    groupRef.child(this.props.groupId).child(this.props.section).child(id).remove();
  }
  move(section, id){
    groupRef.child(this.props.groupId).child(this.props.section).child(id).once('value').then((snap) => {
      groupRef.child(this.props.groupId).child(section).child(id).set(snap.val(), (error) => {
        if(!error){
          setTimeout( () => this.delete(id), 500);
        } else {
          console.log('Could not move task!')
        }
      })
    })
  }
  render() {
    return (
      <div className="bottom">
        {$.map(this.props.tasks, (task, id) => {
          return (
            <Row key={id} className="task">
              <Col
                xs={2}
                className="owner"
                onClick={() => {this.open(id)}}
                style={{'backgroundImage':'url(' + task.avatar + ')', 'backgroundSize':'cover'}}>
                {task.name}
              </Col>
              <UserSelection members={this.props.group.members} open={this.state.open === id} onSelect={this.onSelect.bind(this)}/>
              <Col xs={6} className="description">
                <DescriptionEdit description={task.description} task={id} saveDescription={this.saveDescription.bind(this)}/>
              </Col>
              <Col xs={4} className="stages">
                {$.map(task.stages, (status, name) => {
                  return (
                    <Col xs={4} className={status} key={name} onClick={() => this.changeStatus(status, name, id)}>{name}</Col>
                  )
                })}
              </Col>
              <span onClick={() => this.delete(id)} className="delete glyphicon glyphicon-remove"></span>
              {this.props.section === "active" ? (
                <span onClick={() => this.move('backlog', id)} className="move glyphicon glyphicon-chevron-down"></span>
              ) : (
                <span onClick={() => this.move('active', id)} className="move glyphicon glyphicon-chevron-up"></span>
              )}
            </Row>
          )
        })}
      </div>
    )
  }
}

const UserSelection = (props) => {
  return props.open ? (
    <ul className="owner-selection">
      {$.map(props.members, (member, id) => {
        return <li onClick={() => props.onSelect(id)} key={id}>{member.name}</li>
      })}
    </ul>
  ) : null
}

class DescriptionEdit extends Component {
  state = {
    description: ''
  }
  handleChange(e){
    this.setState({description: e.target.value})
  }
  componentDidMount(){
    this.setState({description: this.props.description})
  }
  render(){
    return(
      <input type="text" value={this.state.description} onBlur={() => this.props.saveDescription(this.state.description, this.props.task)} onChange={ e => this.handleChange(e)}/>
    )
  }
}

export default Tasks;
