'use strict';
import React from 'react';
import Slide from '../component_slider/slide';
import Markdown from './markdown';
import { CodeBlock, Prompt, Output } from './codeblock';
import FileBlock from './fileblock';
import {connect} from 'react-redux';
import * as clusterActions from '../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import _ from 'underscore';
import { browserHistory } from 'react-router';
import { flashAdd } from '../../actions/flashMessageActions';
import Button from '../button';

var ConfigKubeCtl = React.createClass ({

    getInitialState: function() {
      return {
        loading: true,
        keyPair: {
          generated: false,
          generating: false
        }
      };
    },

    generateKeyPair: function() {
      this.setState({
        keyPair: {
          generating: true
        }
      });

      setTimeout(() => {
        this.setState({
          keyPair: {
            generating: false,
            generated: true
          }
        });
      }, 3000);
    },

    componentDidMount: function() {
      if (!this.props.cluster) {
        this.props.dispatch(flashAdd({
          message: <span><b>This organization has no clusters</b><br/>This page might not work as expected.</span>,
          class: 'danger',
          ttl: 3000
        }));

        this.setState({
          loading: 'failed'
        });
      } else if (!this.props.cluster.service_accounts) {
        this.setState({
          loading: true
        });

        this.props.actions.clusterLoadDetails(this.props.cluster.id)
        .then((cluster) => {
          this.setState({
            loading: false
          });
        })
        .catch((error) => {
          console.log(error);
          this.props.dispatch(flashAdd({
            message: 'Something went wrong while trying to load cluster details. Please try again later or contact support: support@giantswarm.io',
            class: 'danger',
            ttl: 3000
          }));

          this.setState({
            loading: 'failed'
          });
        });
      } else {
        this.setState({
          loading: false
        });
      }
    },

    kubeConfig: function() {
      if (this.state.loading === 'failed') {
        return <FileBlock fileName='giantswarm-kubeconfig'>
          Could not load your kubeconfig, sorry. Please contact support.
        </FileBlock>;
      } else if (this.state.loading) {
        return <FileBlock fileName='giantswarm-kubeconfig'>
          Loading ...
        </FileBlock>;
      } else {
        return (
          <FileBlock fileName='giantswarm-kubeconfig'>
            {`
            apiVersion: v1
            kind: Config
            clusters:
             - cluster:
                 certificate-authority-data: ${this.props.cluster.certificate_authority_data}
                 server: ${this.props.cluster.api_endpoint}
               name: ${this.props.cluster.name}
            contexts:
             - context:
                 cluster: ${this.props.cluster.name}
                 user: ${this.props.cluster.service_accounts[0].name}
               name: giantswarm-default
            users:
             - name: ${this.props.cluster.service_accounts[0].name}
               user:
                 client-certificate-data: ${this.props.cluster.service_accounts[0].client_certificate_data}
                 client-key-data: ${this.props.cluster.service_accounts[0].client_key_data}
            `}
          </FileBlock>
        );
      }
    },

    render() {
      return (
        <Slide>
          <h1>Configure kubectl for your cluster</h1>
          <p>Generate and download a cluster configuration file for <code>kubectl</code> to work with your Giant Swarm Kubernetes cluster, including certificates for a unique service account. The Kubernetes service account is the identity you use when working with your cluster using <code>kubectl</code>.</p>
          <p>Note that you can <strong>only</strong> access the full kubeconfig file here <b>once</b>, so please download and store your file away safely immediately after generating it.</p>
          <p>Should you ever lose access to the kubeconfig generated here, you can generate a new one. Your previously generated key and certificate will continue to exist, so you might want to delete it.</p>

          {
            this.state.keyPair.generated
            ?
              this.kubeConfig()
            :
              <div className="create-key-pair">
                <p><strong>Use the button below to create new service account credentials and access your kubeconfig file</strong></p>
                <Button bsStyle="primary" loading={this.state.keyPair.generating} onClick={this.generateKeyPair}>Create cluster configuration</Button>
              </div>
          }

          <p>Once generated, please save that file to your file system with the name <code>giantswarm-kubeconfig</code>.</p>

          <p>Be aware that the file contains your client certificates, so treat this file as sensitive data and make sure it&apos;s only accessible to authorized users.</p>

          <p>Now change into the directory containing the <code>giantswarm-kubeconfig</code> file in a terminal.</p>

          <p>To make the configuration from the provided <code>giantswarm-kubeconfig</code> file available to your <code>kubectl</code>, add its path to the <code>KUBECONFIG</code> environment variable by executing this (replacing <code>/path/to</code> with your actual path):</p>

          <CodeBlock>
            <Prompt>
              {`export KUBECONFIG='\$\{KUBECONFIG\}:/path/to/giantswarm-kubeconfig'`}
            </Prompt>
          </CodeBlock>

          <p><i className='fa fa-graduation-cap' title='For learners'></i> To save some time in the future, add the command above to a terminal profile, e. g. <code>~/.bash_profile</code> to have it available in all new shell sessions.</p>

          <p>Now, whenever you want to switch to working with your Giant Swarm cluster, use this command:</p>

          <CodeBlock>
            <Prompt>
              {`kubectl config use-context giantswarm-default`}
            </Prompt>
          </CodeBlock>

          <p><i className='fa fa-graduation-cap' title='For learners'></i> Again, here you can save your future self some time by creating an alias.</p>

          <p>Now let&apos;s start something on your cluster.</p>

          <button className='primary' onClick={this.props.goToSlide.bind(null, 'example')}>Continue</button><br/>
          <button onClick={this.props.goToSlide.bind(null, 'download')}>Previous</button>
        </Slide>
      );
    }
});

function mapStateToProps(state, ownProps) {
  var selectedOrganization = state.entities.organizations.items[state.app.selectedOrganization];
  var clustersByDate = _.sortBy(selectedOrganization.clusters, 'create_date').reverse();
  var firstClusterId =clustersByDate[0];
  var firstCluster = state.entities.clusters.items[firstClusterId];

  return {
    cluster: firstCluster
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ConfigKubeCtl);