import React from 'react';
import { Button } from 'react-toolbox/lib/button'; // Bundled component import
import AppBar from 'react-toolbox/lib/app_bar';
import Input from 'react-toolbox/lib/input';
import { List, ListItem, ListSubHeader, ListDivider, ListCheckbox } from 'react-toolbox/lib/list';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import Chip from 'react-toolbox/lib/chip';
import Avatar from 'react-toolbox/lib/avatar';
import Dialog from 'react-toolbox/lib/dialog';

import styles from './theme/styles.scss';

class ListView extends React.Component {

  state = {
    db: [
      [
        ["How are you guys?"], [["request_A", "10"], ["request_A", "10"]]
      ],
      [
        ["Ready for the meeting?"],[["request_A", "10"], ["request_A", "10"],["request_A", "10"], ["request_A", "10"]]
      ]
    ],
    dialogActive: false,
    newClassName: '',
    addIndex: 0
  };

  handleDeleteClick = (indexChip, indexItem) => {
    delete this.state.db[indexItem][1][indexChip]
    this.setState({db: this.state.db});
  };

  handleAddClick = (indexItem) => {
    this.setState({dialogActive: !this.state.dialogActive});
    this.setState({addIndex: indexItem});
    console.log("Add button clicked at index: "+indexItem);
  };

  cancelClicked = () => {
    this.setState({dialogActive: !this.state.dialogActive});
    console.log("Cancel clicked");
  };

  saveClicked = () => {
    var name = this.state.newClassName;
    var indexToAdd = this.state.addIndex;
    this.state.db[indexToAdd][1].push([name]);
    this.setState({db: this.state.db});
    this.setState({dialogActive: !this.state.dialogActive});
    console.log("save clicked");
    this.setState({newClassName: ''});
  };

  handleChange = (newClassName, value) => {
    this.setState({...this.state, [newClassName]: value});
  };

  actions = [
    { label: "Cancel", onClick: this.cancelClicked },
    { label: "Save", onClick: this.saveClicked }
  ];

  componentWillReceiveProps (nextProps) {
    console.log("Received props: "+nextProps.db);
    this.setState({db: nextProps.db});
    //this.setState({db: this.state.db});
  };


  render () {
    var that = this;
    var DB = this.state.db.map(function(info, index) {
      return (
        <ItemsResult key={index} information={info} indexItem={index} functionAddChip={that.handleAddClick} functionDeleteChip={that.handleDeleteClick}/>
      );
    });
    var showListView = this.props.showListView;
    var listView = (
      <List selectable ripple>
      <Dialog
      actions={this.actions}
      active={this.state.dialogActive}
      onEscKeyDown={this.cancelClicked}
      onOverlayClick={this.cancelClicked}
      title='Add class'>
      <p> You are now able to add a class.</p>
      <Input type='text' label='Name' name='name' value={this.state.newClassName} onChange={this.handleChange.bind(this, 'newClassName')} />
      </Dialog>
      <ListSubHeader caption='Sentences to train' />
      {DB}
      <ListDivider />
      <ListItem caption='Send to Watson' leftIcon='send' />
      </List>
    );
    if (!showListView) {
      listView = "";
    }
    return (
      <div>
      {listView}
      </div>
    );
  }
}

class ChipResult extends React.Component {
  state = {
    indexItem: -1,
    listOfClass: []
  };
  componentWillMount () {
    this.setState({listOfClass: this.props.listOfClass});
    this.setState({indexItem: this.props.indexItem});
  };
  componentWillReceiveProps (nextProps) {
    this.setState({listOfClass: nextProps.listOfClass});
    this.setState({indexItem: nextProps.indexItem});
  }
  render () {
    var that = this;
    var Chips = this.state.listOfClass.map(function(classTitle, index) {
      var name = classTitle[0];
      var confidence = classTitle[1];
      var response = name + " - " + confidence + "%"
      if (confidence === undefined) {
        console.log("confidence: "+confidence);
        response = name;
      }
      return (
        <Chip key={index} deletable onDeleteClick={() => that.props.functionDeleteChip(index, that.state.indexItem)} >
        {response}
        </Chip>
      );
    });
    return (
      <div>
      {Chips}
      </div>
    );
  };
}

class ItemsResult extends React.Component {
  state = {
    sentence: '',
    indexItem: 0,
    listOfClass: ''
  };

  componentWillMount () {
    this.setState({sentence: this.props.information[0]});
    this.setState({listOfClass: this.props.information[1]});
    this.setState({indexItem: this.props.indexItem});
  };

  componentWillReceiveProps (nextProps) {
    this.setState({sentence: nextProps.information[0]});
    this.setState({listOfClass: nextProps.information[1]});
    this.setState({indexItem: nextProps.indexItem});
  };

  render () {
    return (
      <ListItem
      avatar='https://developer.ibm.com/bluemix/wp-content/uploads/sites/20/2014/10/watsonLogo.png'
      itemContent={(
        <div className={styles.rightButton}>
        <h6>{this.state.sentence}</h6>
        <ChipResult listOfClass={this.state.listOfClass} indexItem={this.state.indexItem} functionDeleteChip={this.props.functionDeleteChip}/>
        </div>
      )}
      key={this.state.indexItem}
      rightActions={[<Button key={this.state.indexItem} icon='add' onClick={() => this.props.functionAddChip(this.state.indexItem)} floating mini />]}
      />
    );
  };
}


const AppBarWatson = () => (
  <AppBar>
  <a href="/">Watson Trainer Manager</a>
  </AppBar>
);

class AppMain extends React.Component {

  state = {
    showListView: false,
    messages: '',
    db: []
  };

  handleTrain = () => {
    var msgs = this.state.messages;
    if (msgs.length > 0) {
      console.log("Messages: "+msgs);
      var arrayMessages = msgs.split('\n');
      arrayMessages = arrayMessages.filter(function(e){return e});
      this.sendPostRequest(arrayMessages);
    }
  };

  sendPostRequest = (arrayMessages) => {
    var that = this;
    $.post('/watson', {text: arrayMessages})
    .done(function onSucess(answers){
      //var DB = new Array(arrayMessages.length);
      var DB = [];
      const NUMBER_CHIPS = 3;
      console.log("OK: "+JSON.stringify(answers));
      var obj = JSON.parse(answers);
      for (var i = 0; i < arrayMessages.length; i++) {
        var array_classes = obj[i].classes;
        var nb_classes = array_classes.length;
        var text = obj[i].text;
        console.log("text: "+text);
        //DB[i] = new Array[nb_classes];
        var CLASSES = [];
        for (var j = 0; j < nb_classes; j++) {
          var name = obj[i].classes[j].class_name;
          var confidence = (obj[i].classes[j].confidence*100).toFixed(1)
          if (j < NUMBER_CHIPS) {
            console.log("Name: "+obj[i].classes[j].class_name+ ", %: "+(obj[i].classes[j].confidence*100).toFixed(1));
            CLASSES[j] = [name, confidence];
          }
        }
        DB[i] = [[text], CLASSES]
      }
      console.log("R: "+DB);
      that.setState({db: DB});
      that.setState({showListView: true});
    })
    .fail(function onError(error) {
      console.log("PAS OK: "+JSON.stringify(error));
    });
  };

  handleChange = (name, value) => {
    this.setState({...this.state, [name]: value});
  };

  render () {
    return (
      <div>
      <AppBarWatson />
      <section style={{ padding: 20 }}>
      <Input floating={false} type='text' label='Messages' name='Messages' value={this.state.messages} onChange={this.handleChange.bind(this, 'messages')} required multiline={true}/>
      <Button icon='send' label='Train it!' onClick={this.handleTrain} flat primary />
      <ListView showListView={this.state.showListView} db={this.state.db} />
      </section>
      </div>
    );
  };
}

const App = () => (
  <AppMain />
);

export default App;
