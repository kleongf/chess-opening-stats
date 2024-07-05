import React, { useState } from 'react';
import LoadIcon from '../components/LoadIcon';
import Accordion from 'react-bootstrap/Accordion';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import axios from 'axios';
import Chessboard from 'chessboardjsx';
import { Chess } from 'chess.js';
import 'bootstrap/dist/css/bootstrap.min.css';

const LoadProfile = () => {
    const [gameData, setGameData] = useState();
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [show, setShow] = useState(false);
    const [positions, setPositions] = useState([]);
    const [current, setCurrent] = useState(0);
    const [maxMoves, setMaxMoves] = useState(0);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleInput = () => {
        setLoading(true);
        axios.get(`http://localhost:5000/${username}/${startDate}/${endDate}`).then((response) => {
            setGameData(response.data);
            setLoading(false);
        }).catch((error) => {
            console.log(error);
            setLoading(false);
        });
    };

    const handlePgn = (pgn) => {
        const chess = new Chess();
        chess.loadPgn(pgn);
        const moves = chess.history({verbose: true});
        const fenMoves = moves.map((move) => move.after);
        setMaxMoves(fenMoves.length-1);
        setPositions(fenMoves);
        setCurrent(0);
    }

    const handleForward = () => {
        if (current <= maxMoves-1) {
            setCurrent(current + 1);
        }
    }
    const handleBackward = () => {
        if (current > 0) {
            setCurrent(current - 1);
        }
    }
    const tdPadding = { padding: "10px" };

    return (
        <div>
            <div>
                <h1>Opening Stats</h1>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required/>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required/>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required/>
                <button onClick={handleInput}>Submit</button>
            </div>

            <div>
                {loading ? <LoadIcon /> :
                <div>
                    <Tabs
            defaultActiveKey="white"
            id="uncontrolled-tab-example"
            className="mb-3"
            >
                    <Tab eventKey="white" title="White">
                    <Accordion>
                        {gameData && Object.keys(gameData.whiteEco).map((key, index) => (
                            <Accordion.Item eventKey={index.toString()} key={index}>
                                <Accordion.Header>
                                    <Row>
                                        <Col><div>{key}</div></Col>
                                        <Col><div>{gameData.whiteEco[key].name}</div></Col>
                                        <Col><div style={{ color: 'green' }}>{gameData.whiteEco[key].win}</div></Col>
                                        <Col><div style={{ color: 'gray' }}>{gameData.whiteEco[key].draw}</div></Col>
                                        <Col><div style={{ color: 'red' }}>{gameData.whiteEco[key].loss}</div></Col>
                                        <Col>
                                            <div>
                                            {((gameData.whiteEco[key].win * 100 + gameData.whiteEco[key].draw * 50) / gameData.whiteEco[key].games.length).toLocaleString(undefined, {
                                                minimumFractionDigits: 1,
                                                maximumFractionDigits: 1
                                            })}%
                                            </div>
                                        </Col>
                                        <Col><div>Average: {(gameData.whiteEco[key].average / gameData.whiteEco[key].games.length)|0}</div></Col>
                                        <Col><div>Performance: {(gameData.whiteEco[key].performance / gameData.whiteEco[key].games.length)|0}</div></Col>
                                    </Row>  
                                </Accordion.Header>
                                <Accordion.Body>
                                    <Table striped bordered hover>
                                    <table>
                                    <thead>
                                        <tr>
                                        <th>Opening Name</th>
                                        <th>White</th>
                                        <th>Black</th>
                                        <th>Result</th>
                                        <th>View</th>
                                        </tr>
                                    </thead>
                                        <tbody>
                                            {gameData.whiteEco[key].games.map((game, gameIndex) => (
                                                <tr key={gameIndex}>
                                                    <td style={tdPadding}>{game.openingName}</td>
                                                    <td style={tdPadding}>{game.firstPlayer}</td>
                                                    <td style={tdPadding}>{game.secondPlayer}</td>
                                                    <td style = {
                                                        game.result === 0 ? { color: "red"} : (game.result === 1 ? {color: "green"} : {color: "gray"})
                                                        }>{game.result}</td>
                                                    <td style={tdPadding}>
                                                        <Button onClick={() => {
                                                            handleShow();
                                                            handlePgn(game.pgn);
                                                        }}>Game</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    </Table>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                    </Tab>
                    <Tab eventKey="black" title="Black">
                    <Accordion>
                        {gameData && Object.keys(gameData.blackEco).map((key, index) => (
                            <Accordion.Item eventKey={index.toString()} key={index}>
                                <Accordion.Header>
                                    <Row>
                                        <Col><div>{key}</div></Col>
                                        <Col><div>{gameData.blackEco[key].name}</div></Col>
                                        <Col><div style={{ color: 'green' }}>{gameData.blackEco[key].win}</div></Col>
                                        <Col><div style={{ color: 'gray' }}>{gameData.blackEco[key].draw}</div></Col>
                                        <Col><div style={{ color: 'red' }}>{gameData.blackEco[key].loss}</div></Col>
                                        <Col>
                                            <div>
                                            {((gameData.blackEco[key].win * 100 + gameData.blackEco[key].draw * 50) / gameData.blackEco[key].games.length).toLocaleString(undefined, {
                                                minimumFractionDigits: 1,
                                                maximumFractionDigits: 1
                                            })}%
                                            </div>
                                        </Col>
                                        <Col><div>Average: {(gameData.blackEco[key].average / gameData.blackEco[key].games.length)|0}</div></Col>
                                        <Col><div>Performance: {(gameData.blackEco[key].performance / gameData.blackEco[key].games.length)|0}</div></Col>
                                    </Row>  
                                </Accordion.Header>
                                <Accordion.Body>
                                    <Table striped bordered hover>
                                    <table>
                                    <thead>
                                        <tr>
                                        <th>Opening Name</th>
                                        <th>White</th>
                                        <th>Black</th>
                                        <th>Result</th>
                                        <th>View</th>
                                        </tr>
                                    </thead>
                                        <tbody>
                                            {gameData.blackEco[key].games.map((game, gameIndex) => (
                                                <tr key={gameIndex}>
                                                    <td style={tdPadding}>{game.openingName}</td>
                                                    <td style={tdPadding}>{game.firstPlayer}</td>
                                                    <td style={tdPadding}>{game.secondPlayer}</td>
                                                    <td style = {
                                                        game.result === 0 ? { color: "red"} : (game.result === 1 ? {color: "green"} : {color: "gray"})
                                                        }>{game.result}</td>
                                                    <td style={tdPadding}>
                                                        <Button onClick={() => {
                                                            handleShow();
                                                            handlePgn(game.pgn);
                                                        }}>Game</Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    </Table>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                    </Tab>
                    </Tabs>
                    </div>
                }
                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                    <Modal.Title>View Game</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Chessboard position={positions[current]} width={465}/>
                        <Button onClick={() => setCurrent(0)}>First</Button>
                        <Button onClick={handleBackward} disabled={current===0}>&lt;</Button>
                        <Button onClick={handleForward} disabled={current>maxMoves-1}>&gt;</Button>
                        <Button onClick={() => setCurrent(maxMoves)}>Last</Button>
                        
                    </Modal.Body>
                
                </Modal>
                
                
            </div>
        </div>
    );
};

export default LoadProfile;
