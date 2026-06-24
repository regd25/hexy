import './styles/main.css'
import { mountApp } from './app.js'

const root = document.getElementById('root')
if (!root) throw new Error('No root element found')

mountApp(root)
