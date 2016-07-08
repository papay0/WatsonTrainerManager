import React from 'react';
import SuccessButton from './SuccessButton.js';    // A button with complex overrides
import { Button } from 'react-toolbox/lib/button'; // Bundled component import
import AppBar from 'react-toolbox/lib/app_bar';
import Input from 'react-toolbox/lib/input';
import { List, ListItem, ListSubHeader, ListDivider, ListCheckbox } from 'react-toolbox/lib/list';
import ProgressBar from 'react-toolbox/lib/progress_bar';
import Chip from 'react-toolbox/lib/chip';
import Avatar from 'react-toolbox/lib/avatar';
import Dialog from 'react-toolbox/lib/dialog';

import styles from './theme/styles.scss';

class DialogTestButton extends React.Component {
  state = {
    active: false,
    showList: false
  };

  handleToggle = () => {
    this.setState({active: !this.state.active});
  }

  showList = () => {
    this.setState({active: !this.state.active});
    this.setState({showList: !this.state.showList});
  }

  actions = [
    { label: "Cancel", onClick: this.handleToggle },
    { label: "Got it", onClick: this.showList }
  ];

  render () {
    var list = "";
    if (this.state.showList) {
      list = <ListView />
    }
    return (
      <div>
        <Button icon='add' label='Add to trainer' onClick={this.handleToggle} primary/>
        <Dialog
          actions={this.actions}
          active={this.state.active}
          onEscKeyDown={this.handleToggle}
          onOverlayClick={this.handleToggle}
          title='Training in progress'
        >
          <ProgressBar type="circular" mode="indeterminate" />
        </Dialog>
        {list}
      </div>
    );
  }
}

class ListView extends React.Component {

  state = {
    array: ["A", "B"],
    db: [
      [
        ["A?"], ["A-A", "A-B"]
      ],
      [
        ["B?"],["B-A", "B-B","B-C", "B-D"]
      ]
    ]
  };

  handleDeleteClick = (indexChip, indexItem) => {  
    delete this.state.db[indexItem][1][indexChip]
    this.setState({db: this.state.db});
  };

  handleAddClick = (index) => {
    console.log("Add button clicked at index: "+index);
  };

  render () {
    var that = this;
    var DB = this.state.db.map(function(info, index) {
      return (
        <ItemsResult key={index} information={info} indexItem={index} functionAddChip={that.handleAddClick} functionDeleteChip={that.handleDeleteClick}/>
      );
    });
    return (
      <List selectable ripple>
        <ListSubHeader caption='Sentences to train' />
        {DB}
        <ListDivider />
        <ListItem caption='Send to Watson' leftIcon='send' />
      </List>
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
  componentWillReceiveProps () {
    console.log("[Chips] New props are comming!");
    this.setState({listOfClass: this.props.listOfClass});
    this.setState({indexItem: this.props.indexItem});
  }
  render () {
    var that = this;
    var Chips = this.state.listOfClass.map(function(classTitle, index) {
      return (
        <Chip key={index} deletable onDeleteClick={() => that.props.functionDeleteChip(index, that.state.indexItem)} >
          {classTitle}
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

  componentWillReceiveProps () {
    console.log("[Item] New props are comming!");
    this.setState({sentence: this.props.information[0]});
    this.setState({listOfClass: this.props.information[1]});
    this.setState({indexItem: this.props.indexItem});
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

class InputMessageConversation extends React.Component {
  state = { messages: ''};

  handleChange = (name, value) => {
    this.setState({...this.state, [name]: value});
  };

  render () {
    return (
          <Input floating={false} type='text' label='Messages' name='Messages' value={this.state.messages} onChange={this.handleChange.bind(this, 'messages')} multiline={true}/>
    );
  }
}

const AppBarWatson = () => (
  <AppBar>
    <a href="/">Watson Trainer Manager</a>
  </AppBar>
);

const App = () => (
  <div>
    <AppBarWatson />
    <section style={{ padding: 20 }}>
      <InputMessageConversation />
      <Button icon='send' label='Train it!' flat primary />
      <ListView />
    </section>
  </div>
);

export default App;
