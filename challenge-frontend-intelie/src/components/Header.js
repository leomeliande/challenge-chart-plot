import Typography from '@material-ui/core/Typography'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import React from 'react'

export default function AppHeader() {
    return (
        <AppBar position="static" style={{ background: '#00CC7A' }}>
            <Toolbar>
                <Typography variant="h6" color="inherit">
                    Leonardo's Challange 
                </Typography>
            </Toolbar>
        </AppBar>
    )
}