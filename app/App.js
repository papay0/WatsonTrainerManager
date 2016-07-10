import React from 'react';
import { Button } from 'react-toolbox/lib/button'; // Bundled component import
import AppBar from 'react-toolbox/lib/app_bar';
import Input from 'react-toolbox/lib/input';
import { List, ListItem, ListSubHeader, ListDivider, ListCheckbox } from 'react-toolbox/lib/list';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import Chip from 'react-toolbox/lib/chip';
import Avatar from 'react-toolbox/lib/avatar';
import Dialog from 'react-toolbox/lib/dialog';
import Snackbar from 'react-toolbox/lib/snackbar';
import Autocomplete from 'react-toolbox/lib/autocomplete';

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
    addIndex: 0,
    classes: [],
    newClassesName: [],
    test: ''
  };

  handleDeleteClick = (indexChip, indexItem) => {
    delete this.state.db[indexItem][1][indexChip]
    this.setState({db: this.state.db});
  };

  handleAddClick = (indexItem) => {
    this.setState({dialogActive: !this.state.dialogActive});
    this.setState({addIndex: indexItem});
    console.log("Add button clicked at index: "+indexItem);
    this.getClasses();
  };

  cancelClicked = () => {
    this.setState({dialogActive: !this.state.dialogActive});
    console.log("Cancel clicked");
  };

  handleAddNewClassName = () => {
    if (this.state.newClassName !== '') {
      this.addClassToApi(this.state.newClassName)
      var newArrayClasses = this.state.newClassesName;
      console.log("ARRRAYYYYYY: ", newArrayClasses);
      newArrayClasses.push(this.state.newClassName);
      console.log("New array classes: ", newArrayClasses);


      var arrayClassesInitial = this.state.classes;
      arrayClassesInitial.push(this.state.newClassName);
      this.setState({newClassesName: newArrayClasses});
      this.setState({classes: arrayClassesInitial});
      this.setState({newClassName: ''});
    }
  };

  addClassToApi = (name) => {
    $.post('/api/addClass', {className: name})
    .done(function onSucess(answers){
      console.log("[CLASS ADDED] OK: "+JSON.stringify(answers));
    })
    .fail(function onError(error) {
      console.log("[CLASS NOT ADDED] PAS OK: "+JSON.stringify(error));
    });

  };

  handleMultipleChange = (value) => {
    this.setState({newClassesName: value});
  };

  saveClicked = () => {
    var names = this.state.newClassesName;
    var indexToAdd = this.state.addIndex;
    for (var i in names) {
      this.state.db[indexToAdd][1].push([names[i]]);
    }
    this.setState({db: this.state.db});
    this.setState({dialogActive: !this.state.dialogActive});
    console.log("save clicked");
    this.setState({newClassName: ''});
    this.setState({newClassesName: []});
  };

  handleChange = (newClassName, value) => {
    this.setState({...this.state, [newClassName]: value});
  };

  actions = [
    { label: "Add", onClick: this.handleAddNewClassName },
    { label: "Cancel", onClick: this.cancelClicked },
    { label: "Save", onClick: this.saveClicked }
  ];

  getArrayOfLines = (db) => {
    var str_line = "";
    var message = "";
    var a_class = "";
    var db_filter = db.filter(function(e){return e});
    var arrayOfLines = [];
    for (var i = 0; i < db_filter.length; i++) {
      str_line = "";
      message = "";
      a_class = "";
      message = db_filter[i][0];
      for (var j = 0; j < db_filter[i][1].length; j++) {
        str_line = "\""+message+"\"";
        if (db_filter[i][1][j] !== undefined) {
          if (db_filter[i][1][j].length > 1) {
            a_class = db_filter[i][1][j][0];
          } else {
            a_class = db_filter[i][1][j];
          }
          str_line += ","+a_class;
          arrayOfLines.push(str_line);
        }
      }
      //arrayOfLines.push(str_line);
      //console.log("Line in file: "+str_line);
    }
    return arrayOfLines;
  };

  handleOnClickWatson = () => {
    var arrayOfLines = this.getArrayOfLines(this.state.db);
    //console.log("Array of lines: "+arrayOfLines);
    this.sendArrayOfLinesToServer(arrayOfLines);
  };

  sendArrayOfLinesToServer = (arrayOfLines) => {
    var that = this;
    $.post('/api/trainer', {arrayOfLines: arrayOfLines})
    .done(function onSucess(answers){
      console.log("OK: "+JSON.stringify(answers));
    })
    .fail(function onError(error) {
      console.log("PAS OK: "+JSON.stringify(error));
    });
  }

  componentWillReceiveProps (nextProps) {
    //dconsole.log("Received props: "+nextProps.db);
    this.setState({db: nextProps.db});
    //this.setState({db: this.state.db});
  };

  getClasses = () => {
    console.log("classes: "+this.state.classes);
    var that = this;
    $.get('/api/classes')
    .done(function onSucess(answers){
      //console.log("OK GET CLASSES: ", answers);
      var obj = JSON.parse(answers);
      that.setState({classes: obj[0]});
    })
    .fail(function onError(error) {
      console.log("PAS OK: "+JSON.stringify(error));
    });
  }

  render () {
    console.log("new classes name: ", this.state.newClassName);
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
      <Input floating={false} type='text' label='Enter a new class name' name='new class' value={this.state.newClassName} onChange={this.handleChange.bind(this, 'newClassName')} multiline={false}/>
      <Autocomplete
      direction="down"
      selectedPosition="above"
      label="Choose an existing class"
      onChange={this.handleMultipleChange}
      source={this.state.classes}
      value={this.state.newClassesName}
      multiple={true}
      suggestionMatch={"anywhere"}
      />
      </Dialog>
      <ListSubHeader caption='Sentences to train' />
      {DB}
      <ListDivider />
      <ListItem caption='Send to Watson' leftIcon='send' onClick={() => this.handleOnClickWatson()} />
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
    db: [],
    activeSnackbar: false,
    messageSnapbar: '',
    styleSnackbar: styles.SnackbarSuccess
  };

  handleTrain = () => {
    var msgs = this.state.messages;
    if (msgs.length > 0) {
      console.log("Messages: "+msgs);
      var arrayMessages = msgs.split('\n');
      arrayMessages = arrayMessages.filter(function(e){return e});
      this.sendPostRequestWithMessagesToTrain(arrayMessages);
    }
  };

  sendPostRequestWithMessagesToTrain = (arrayMessages) => {
    var that = this;
    $.post('/api/watson', {text: arrayMessages})
    .done(function onSucess(answers){
      //var DB = new Array(arrayMessages.length);
      that.setState({activeSnackbar: true});
      that.setState({messageSnapbar: 'Training successful'});
      var DB = [];
      const NUMBER_CHIPS = 3;
      console.log("OK: "+JSON.stringify(answers));
      var obj = JSON.parse(answers);
      for (var i = 0; i < arrayMessages.length; i++) {
        var array_classes = obj[i].classes;
        var nb_classes = array_classes.length;
        var text = obj[i].text;
        //console.log("text: "+text);
        //DB[i] = new Array[nb_classes];
        var CLASSES = [];
        for (var j = 0; j < nb_classes; j++) {
          var name = obj[i].classes[j].class_name;
          var confidence = (obj[i].classes[j].confidence*100).toFixed(1)
          if (j < NUMBER_CHIPS) {
            //console.log("Name: "+obj[i].classes[j].class_name+ ", %: "+(obj[i].classes[j].confidence*100).toFixed(1));
            CLASSES[j] = [name, confidence];
          }
        }
        DB[i] = [[text], CLASSES]
      }
      that.setState({db: DB});
      that.setState({showListView: true});
    })
    .fail(function onError(error) {
      alert("Check your username & password, cannot authenticate.");
      console.log("PAS OK: "+JSON.stringify(error));
    });
  };

  handleChange = (name, value) => {
    this.setState({...this.state, [name]: value});
  };



  handleSnackbarTimeoutOrClick = () => {
    console.log('handleSnackbarClick');
    this.setState({ activeSnackbar: false });
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
      <Snackbar
      action='Dismiss'
      active={this.state.activeSnackbar}
      icon='question_answer'
      label={this.state.messageSnapbar}
      timeout={3000}
      onClick={this.handleSnackbarTimeoutOrClick}
      onTimeout={this.handleSnackbarTimeoutOrClick}
      type='warning'
      className={this.state.styleSnackbar}
      />
      </div>
    );
  };
}

const App = () => (
  <AppMain />
);

export default App;
