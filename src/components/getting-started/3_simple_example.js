'use strict';
import React from 'react';
import { CodeBlock, Prompt, Output } from './codeblock';
import { connect } from 'react-redux';
import * as clusterActions from '../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import { flashAdd } from '../../actions/flashMessageActions';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'react-breadcrumbs';

class SimpleExample extends React.Component {
  constructor(props) {
    super(props);

    var ingressBaseDomain = window.config.ingressBaseDomain;

    this.state = {
      loading: true,
      ingressBaseDomain: ingressBaseDomain,
    };
  }

  clusterBaseDomain() {
    if (this.props.cluster) {
      return `${this.props.cluster.id}.${this.state.ingressBaseDomain}`;
    } else {
      return `12345.${this.state.ingressBaseDomain}`;
    }
  }

  componentDidMount() {
    if (!this.props.cluster) {
      this.props.dispatch(
        flashAdd({
          message: (
            <span>
              <b>This organization has no clusters</b>
              <br />
              This page might not work as expected.
            </span>
          ),
          class: 'danger',
          ttl: 3000,
        })
      );

      this.setState({
        loading: 'failed',
      });
    } else {
      this.setState({
        loading: true,
      });

      this.props.actions
        .clusterLoadDetails(this.props.cluster.id)
        .then(() => {
          this.setState({
            loading: false,
          });
        })
        .catch(() => {
          this.props.dispatch(
            flashAdd({
              message:
                'Something went wrong while trying to load cluster details. Please try again later or contact support: support@giantswarm.io',
              class: 'danger',
              ttl: 3000,
            })
          );

          this.setState({
            loading: 'failed',
          });
        });
    }
  }

  linkToHelloWorld() {
    if (this.state.loading === 'failed') {
      return 'Could not figure out the url for your hello world app. Sorry.';
    } else if (this.state.loading) {
      return 'Figuring out the url...';
    } else {
      var url = `http://helloworld.${this.clusterBaseDomain()}`;
      return (
        <a href={url} target='_blank' rel='noopener noreferrer'>
          {url}
        </a>
      );
    }
  }

  render() {
    return (
      <Breadcrumb
        data={{ title: 'EXAMPLE', pathname: '/getting-started/example/' }}
      >
        <div className='centered col-9'>
          <h1>Let&apos;s create an example application</h1>
          <p>
            To check if every part of your cluster is running as it should,
            let&apos;s create an entire application. When set up, this
            application will provide a little web server running in multiple
            pods.
          </p>
          <p>
            We use <code>kubectl</code> to create the service, deployment, and
            ingress resource from a manifest hosted on GitHub.
          </p>

          <div className='aside'>
            <p>
              <i className='fa fa-graduation-cap' title='For learners' /> If
              you&apos;re new to Kubernetes: A manifest describes things to
              create in Kubernetes. In this case the manifest describes two
              different things, a service and a deployment. The service is there
              to expose containers (here: the ones with the label app:
              helloworld) inside your cluster via a certain hostname and port.
              The deployment describes your helloworld deployment. It manages a
              replica set, which ensures that a number of pods (two, actually)
              containing Docker containers from a certain image are running.
            </p>
          </div>

          <p>First we download the manifest:</p>
          <CodeBlock>
            <Prompt>
              {`
                  wget https://raw.githubusercontent.com/giantswarm/helloworld/master/helloworld-manifest.yaml
                `}
            </Prompt>
          </CodeBlock>

          <p>
            Next use <code>sed</code> to replace the placeholder{' '}
            <code>YOUR_CLUSTER_BASE_DOMAIN</code> with{' '}
            <code>{this.clusterBaseDomain()}</code>.
          </p>
          <CodeBlock>
            <Prompt>
              {`
                  sed -i "" "s/YOUR_CLUSTER_BASE_DOMAIN/${this.clusterBaseDomain()}/" helloworld-manifest.yaml
                `}
            </Prompt>
          </CodeBlock>

          <p>Finally apply the manifest to your cluster:</p>
          <CodeBlock>
            <Prompt>
              {`
                 kubectl apply -f helloworld-manifest.yaml
                `}
            </Prompt>
            <Output>
              {`
                  service 'helloworld' created
                  deployment 'helloworld' created
                  ingress "helloworld" created
                `}
            </Output>
          </CodeBlock>

          <p>
            The deployment will create a replica set, which in turn will create
            pods with the Docker containers running. Once they are up, which
            should take only a few seconds, you can access them using this URL:
          </p>

          <p>{this.linkToHelloWorld()}</p>

          <p>
            This should show a little welcome message from the Giant Swarm team.
          </p>

          <br />

          <h1>Inspecting your service</h1>
          <p>
            Let&apos;s inspect what has actually been generated by Kubernetes
            based on our manifest. This first command lists all deployments,
            filtered to those that have a label <code>app: helloworld</code>:
          </p>

          <CodeBlock>
            <Prompt>{`kubectl get deployment -l app=helloworld`}</Prompt>
            <Output>
              {`
                  NAME         DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
                  helloworld   2         2         2            2           2m
                `}
            </Output>
          </CodeBlock>

          <p>
            It should tell us that 2 of our 2 desired pods are currently
            running. Then we list the available services with the according
            label:
          </p>

          <CodeBlock>
            <Prompt>{`kubectl get svc -l app=helloworld`}</Prompt>
            <Output>
              {`
                  NAME         CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
                  helloworld   10.100.70.153   <none>        80/TCP    2m
                `}
            </Output>
          </CodeBlock>

          <p>And finally we list the pods:</p>

          <CodeBlock>
            <Prompt>{`kubectl get pods -l app=helloworld`}</Prompt>
            <Output>
              {`
                  NAME                          READY     STATUS    RESTARTS   AGE
                  helloworld-3495070191-0ynir   1/1       Running   0          3m
                  helloworld-3495070191-onuik   1/1       Running   0          3m
                `}
            </Output>
          </CodeBlock>

          <div className='aside'>
            <p>
              <i className='fa fa-graduation-cap' title='For learners' /> The
              exact pod names vary in each case, the first suffix functions a
              bit like a version number for your deployment, this changes with
              updates to the deployment. The last part of the pod name is used
              by Kubernetes to disambiguate the name using a unique suffixes.
            </p>
          </div>

          <p>
            To investigate a bit closer what our containers are doing inside
            their pods, we can look at their logs, one pod at a time. Be sure to
            replace the version and suffix fields (in brackets) with the actual
            ones you got from the
            <code>get pods</code> command above.
          </p>

          <CodeBlock>
            <Prompt>{`kubectl logs helloworld-<version>-<suffix>`}</Prompt>
            <Output>
              {`
                  2016/05/20 10:00:00 Starting up at :8080
                  2016/05/20 10:03:19 GET /
                `}
            </Output>
          </CodeBlock>

          <CodeBlock>
            <Prompt>{`kubectl logs <helloworld-<version>-<suffix>`}</Prompt>
            <Output>
              {`
                  2016/05/20 10:00:07 Starting up at :8080
                  2016/05/20 10:03:19 GET /giantswarm_logo_standard_white.svg
                  2016/05/20 10:03:19 GET /blue-bg.jpg
                `}
            </Output>
          </CodeBlock>

          <p>
            You should see in the log entries that the requests for the HTML
            page, the logo, and the background images have been distributed over
            both running pods and their respective containers pretty much
            randomly.
          </p>
          <p>
            To clean things up, we use the <code>kubectl delete</code> command
            on the service, deployment, and ingress we created initially:
          </p>

          <CodeBlock>
            <Prompt>
              {`kubectl delete service,deployment,ingress helloworld`}
            </Prompt>
            <Output>
              {`
                  service "helloworld" deleted
                  deployment "helloworld" deleted
                  ingress "helloworld" deleted
                `}
            </Output>
          </CodeBlock>

          <div className='celebration'>
            <span>🎉</span>
            <h3>Congratulations</h3>
            <p>
              You have created &ndash; and destroyed &ndash; your first
              application on your brand new Kubernetes cluster on Giant Swarm.
            </p>
          </div>

          <div className='component_slider--nav'>
            <Link to='/getting-started/configure/'>
              <button>
                <i className='fa fa-caret-left' /> Back
              </button>
            </Link>

            <Link to='/getting-started/next-steps/'>
              <button className='primary'>
                Continue <i className='fa fa-caret-right' />
              </button>
            </Link>
          </div>
        </div>
      </Breadcrumb>
    );
  }
}

SimpleExample.propTypes = {
  cluster: PropTypes.object,
  dispatch: PropTypes.func,
  actions: PropTypes.object,
  goToSlide: PropTypes.func,
};

function mapStateToProps(state) {
  var selectedCluster =
    state.entities.clusters.items[state.app.selectedCluster];

  return {
    cluster: selectedCluster,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch,
  };
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(SimpleExample);
