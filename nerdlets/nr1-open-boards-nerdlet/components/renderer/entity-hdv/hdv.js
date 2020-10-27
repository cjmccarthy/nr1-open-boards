import React from 'react';
import HexagonGrid from './grid';
import { Divider, Dropdown, Icon } from 'semantic-ui-react';
// import { Popup } from 'semantic-ui-react';
import { navigation } from 'nr1';

export default class EntityHdvWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedGuid: '',
      selectedGuidType: '',
      selectedGuidName: '',
      selectedGuidData: {}
    };
  }

  entityNavigate = (type, entityGuid) => {
    switch (type) {
      case 'KUBERNETESCLUSTER':
        const nerdletWithState = {
          id: 'k8s-cluster-explorer-nerdlet.k8s-cluster-explorer',
          urlState: {
            entityId: entityGuid
          }
        };
        navigation.openStackedNerdlet(nerdletWithState);
        break;
      default:
        navigation.openStackedEntity(entityGuid);
    }
  };

  hexClick = (guid, type, name, relationshipData) => {
    // navigation.openStackedEntity(guid);
    if (guid in relationshipData) {
      this.setState({
        selectedGuid: guid,
        selectedGuidType: type,
        selectedGuidName: name,
        selectedGuidData: relationshipData[guid]
      });
    } else {
      window.alert('No relationship data available...');
    }
  };

  render() {
    const {
      limit,
      data,
      width,
      height,
      relationshipData,
      isFetching
    } = this.props;

    const {
      selectedGuid,
      selectedGuidType,
      selectedGuidName,
      selectedGuidData
    } = this.state;

    const getHexProps = hexagon => {
      let fill = '';
      switch (hexagon.alertSeverity) {
        case 'CRITICAL': {
          fill = 'red';
          break;
        }
        case 'WARNING': {
          fill = 'orange';
          break;
        }
        case 'NOT_ALERTING': {
          fill = 'green';
          break;
        }
        case 'NOT_CONFIGURED': {
          fill = 'grey';
          break;
        }
      }
      return {
        style: {
          fill,
          stroke: 'white'
        },
        onClick: () =>
          this.hexClick(
            hexagon.guid,
            hexagon.type,
            hexagon.name,
            relationshipData
          )
      };
    };

    const getSubHexProps = hexagon => {
      let fill = '';
      switch (hexagon.alertSeverity) {
        case 'CRITICAL': {
          fill = 'red';
          break;
        }
        case 'WARNING': {
          fill = 'orange';
          break;
        }
        case 'NOT_ALERTING': {
          fill = 'green';
          break;
        }
        case 'NOT_CONFIGURED': {
          fill = 'grey';
          break;
        }
      }
      return {
        style: {
          fill,
          stroke: 'white'
        },
        onClick: () => this.entityNavigate(hexagon.type, hexagon.guid)
      };
    };

    const renderHexagonContent = hexagon => {
      return (
        <span
          style={{
            x: '50%',
            y: '50%',
            fontSize: 100,
            textAnchor: 'middle',
            color: 'white',
            fill: 'white'
          }}
        >
          abc
        </span>
      );
      // <text
      //   title={hexagon.name}
      //   x="50%"
      //   y="50%"
      //   fontSize={100}
      //   fontWeight="lighter"
      //   style={{ fill: 'white' }}
      //   textAnchor="middle"
      //   onMouseOver={() => console.log('over')}
      // >
      //   &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
      // </text>
    };

    const alerts = {
      CRITICAL: [],
      WARNING: [],
      NOT_ALERTING: [],
      NOT_CONFIGURED: []
    };

    for (let z = 0; z < data.length; z++) {
      alerts[data[z].alertSeverity].push(data[z]);
    }

    let hexagons = [];

    Object.keys(alerts).forEach(a => {
      if (alerts[a].length > 0) {
        hexagons = [...hexagons, ...alerts[a]];
      }
    });

    if (limit && limit > 0) {
      hexagons = hexagons.slice(0, limit);
    }

    const msg = isFetching ? 'Fetching entities...' : 'No entities found';
    const subHdrStyle = {
      fontFamily: 'monospace',
      fontSize: '13px'
    };

    const warnHdrStyle = {
      fontFamily: 'monospace',
      fontSize: '15px'
    };

    const sourceHexagons = [];
    const targetHexagons = [];

    if (selectedGuid) {
      (selectedGuidData.relationships || []).forEach(r => {
        if (r.source.entity.guid !== selectedGuid) {
          sourceHexagons.push(r.source.entity);
        }

        if (r.source.entity.guid === selectedGuid && r.target.entity) {
          targetHexagons.push(r.target.entity);
        }
      });
    }

    let heightDivisor = 1;
    if (selectedGuid && selectedGuidData) {
      if (sourceHexagons.length === 0) {
        heightDivisor += 0.5;
      } else {
        heightDivisor += 2;
      }
      if (targetHexagons.length === 0) {
        heightDivisor += 0.5;
      } else {
        heightDivisor += 2;
      }
    }

    return (
      <div>
        {hexagons.length > 0 ? (
          <div
            style={{ height: height + 3, width: width - 5, overflowY: 'auto' }}
          >
            <HexagonGrid
              gridWidth={width - 5}
              gridHeight={selectedGuid ? height / heightDivisor : height}
              hexagons={hexagons}
              hexProps={getHexProps}
              renderHexagonContent={renderHexagonContent}
            />

            {selectedGuid ? (
              <>
                <span
                  style={{
                    float: 'left',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                  onClick={() =>
                    this.entityNavigate(selectedGuidType, selectedGuid)
                  }
                >
                  {selectedGuidData.name}
                </span>
                {selectedGuidType === 'APPLICATION' ? (
                  <span
                    style={{
                      float: 'left',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      const nerdletWithState = {
                        id:
                          'distributed-tracing-nerdlets.distributed-trace-list',
                        urlState: {
                          query: {
                            operator: 'AND',
                            indexQuery: {
                              conditionType: 'INDEX',
                              operator: 'AND',
                              conditions: [
                                // {
                                //   attr: 'entity.guid',
                                //   operator: 'EQ',
                                //   value: selectedGuid
                                // }
                              ]
                            },
                            spanQuery: {
                              operator: 'AND',
                              conditionSets: [
                                {
                                  conditionType: 'SPAN',
                                  operator: 'AND',
                                  conditions: [
                                    {
                                      attr: 'entity.name',
                                      operator: 'EQ',
                                      value: selectedGuidName
                                    }
                                  ]
                                }
                              ]
                            }
                          }
                        }
                      };
                      navigation.openStackedNerdlet(nerdletWithState);
                    }}
                  >
                    - Traces
                  </span>
                ) : (
                  <></>
                )}
                <span
                  style={{
                    float: 'right',
                    marginRight: '10px'
                  }}
                >
                  {/* <Dropdown text="Filters" style={{ paddingRight: '5px' }}>
                    <Dropdown.Menu>
                      <Dropdown.Item text="Ignore Infrastructure" />
                      <Dropdown.Item text="Ignore APM" />
                      <Dropdown.Item icon="folder" text="icon test" />
                    </Dropdown.Menu>
                  </Dropdown> */}
                  <Icon
                    style={{ cursor: 'pointer' }}
                    name="close"
                    onClick={() =>
                      this.setState({ selectedGuid: '', selectedGuidData: {} })
                    }
                  />
                </span>
                <Divider style={{ marginTop: '10px', marginBottom: '10px' }} />
              </>
            ) : (
              ''
            )}

            {selectedGuid && selectedGuidData ? (
              <>
                {sourceHexagons.length > 0 ? (
                  <>
                    <span style={subHdrStyle}>Sources</span>
                    <HexagonGrid
                      gridWidth={width - 5}
                      gridHeight={
                        selectedGuid ? height / heightDivisor : height
                      }
                      hexagons={sourceHexagons}
                      hexProps={getSubHexProps}
                      renderHexagonContent={renderHexagonContent}
                    />
                  </>
                ) : (
                  <span style={warnHdrStyle}>
                    No sources found.
                    <br />
                  </span>
                )}

                {targetHexagons.length > 0 ? (
                  <>
                    <Divider
                      style={{ marginTop: '5px', marginBottom: '5px' }}
                    />
                    <span style={subHdrStyle}>Targets</span>
                    <br />
                    <HexagonGrid
                      gridWidth={width - 5}
                      gridHeight={
                        selectedGuid ? height / heightDivisor : height
                      }
                      hexagons={targetHexagons}
                      hexProps={getSubHexProps}
                      renderHexagonContent={renderHexagonContent}
                    />
                  </>
                ) : (
                  <span style={warnHdrStyle}>
                    No targets found.
                    <br />
                  </span>
                )}
              </>
            ) : (
              ''
            )}
          </div>
        ) : (
          msg
        )}
      </div>
    );
  }
}
