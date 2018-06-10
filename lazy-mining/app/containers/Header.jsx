import React from "react";
import { Toolbar, Actionbar, Button, ButtonGroup } from "react-photonkit";

class Header extends React.Component {
  render() {
    return (
      <Toolbar title="">
          <ButtonGroup>
            <Button glyph="home" />
            <Button glyph="github" />
          </ButtonGroup>
      </Toolbar>
    );
  }
}

export default Header;
