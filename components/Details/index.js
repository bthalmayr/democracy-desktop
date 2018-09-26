import { Component } from 'react';
import { withRouter } from 'next/router';
import { Col, Collapse, Timeline, Anchor as AnchorComponent } from 'antd';
import { Query } from 'react-apollo';
import styled from 'styled-components';
import getConfig from 'next/config';

// Components
import Head from 'next/head';
import ShareButtons from './ShareButtons';
import Overview from './Overview';
import Tags from './Tags';
import DetailsPanel from './Panels/Details';
import DocumentsPanel from './Panels/Documents';
import VoteResultsPanel from './Panels/VoteResults';
import AppStimmen from './AppStimmen';

// GraphQL
import PROCEDURE from 'GraphQl/queries/procedure';

// Helpers
import { getImage } from 'Helpers/subjectGroupToIcon';
import { titleByProcedureListType } from '../../lib/helpers/listTypeConvert';

const { publicRuntimeConfig } = getConfig();

const { DOMAIN_DESKTOP } = publicRuntimeConfig;

const AnchorLink = AnchorComponent.Link;
const PanelComponent = Collapse.Panel;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const AsideLeft = styled.div`
  min-width: 55px;
`;

const AsideRight = styled.div`
  display: none;

  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    display: block;
  }
`;

const ContentSection = styled.section`
  flex: 1;
  background-color: ${({ theme }) => theme.backgrounds.secondary};
`;

const Anchor = styled(AnchorComponent)`
  .ant-anchor-link a {
    font-size: 18px;
    background-color: transparent;
    color: rgb(143, 142, 148);
    padding: 10px;
    border-radius: 3px 0 0 3px;
  }
  .ant-anchor > .ant-anchor-link:first-of-type > a,
  .ant-anchor > .ant-anchor-link:last-of-type > a {
    background-color: rgb(244, 243, 243);
  }
  .ant-anchor-link.ant-anchor-link-active > a {
    background-color: rgb(68, 148, 211) !important;
    color: rgb(255, 255, 255);
  }
`;

const Section = styled.section`
  background-color: ${({ theme }) => theme.backgrounds.secondary};
  padding-top: ${({ theme }) => theme.space(3)}px;
`;

const ShareAside = styled.aside`
  position: sticky;
  top: ${({ theme }) => theme.space(3)}px;
`;

const ASide = styled.aside`
  padding-top: ${({ theme }) => theme.space(3)}px;
`;

const WhiteColPad = styled(Col).attrs({
  xs: 24,
  sm: 24,
  md: 24,
  lg: 24,
})`
  background-color: ${({ theme }) => theme.backgrounds.primary};
  margin-top: ${({ theme }) => theme.space(3)}px;
  margin-bottom: ${({ theme }) => theme.space(4)}px;
`;

const Panel = styled(PanelComponent)`
  font-size: ${({ theme }) => theme.fontSizes.default};
  padding: 0;

  .ant-collapse-item {
    border: 0 !important;
  }

  .ant-collapse-header {
    font-weight: bold;
    border-radius: 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
    background-color: ${({ theme }) => theme.backgrounds.primary};
    padding-left: ${({ theme }) => theme.space(4)}px !important;
    padding-right: ${({ theme }) => theme.space(4)}px !important;

    .arrow {
      right: 16px;
      left: auto !important;
      color: ${({ theme }) => theme.colors.arrow};
      font-size: ${({ theme }) => theme.fontSizes.small} !important;
    }
  }

  .ant-collapse-header .arrow {
    transform: rotate(90deg) !important;
  }

  .ant-collapse-header[aria-expanded='true'] .arrow {
    transform: rotate(-90deg) !important;
  }

  .ant-collapse-content {
    .ant-collapse-content-box {
      padding-left: ${({ theme }) => theme.space(4)}px;
      padding-right: ${({ theme }) => theme.space(4)}px;
      padding-bottom: ${({ theme }) => theme.space(4)}px;
      padding-top: ${({ theme }) => theme.space(1.5)}px !important;
    }
  }
`;

const ImageCol = styled.div`
  max-height: 550px;
  overflow: hidden;
`;

const Image = styled.img`
  width: 100%;
`;

class Details extends Component {
  render() {
    const {
      router: { query, asPath },
    } = this.props;

    if (!query.id) {
      return null;
    }

    return (
      <Section>
        {/* Query is empty in first call... */}
        <Query query={PROCEDURE} variables={{ id: query.id }}>
          {({ loading, error, data: { procedure } }) => {
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error :(</p>;
            return (
              <>
                <Head>
                  <title>{`${titleByProcedureListType({
                    listType: procedure.listType,
                    completed: procedure.completed,
                  })}: ${procedure.title}`}</title>
                  <meta
                    property="og:title"
                    content={`${titleByProcedureListType({
                      listType: procedure.listType,
                      completed: procedure.completed,
                    })}: ${procedure.title}`}
                  />
                  <meta
                    name="page-topic"
                    content={`${titleByProcedureListType({
                      listType: procedure.listType,
                      completed: procedure.completed,
                    })}: ${procedure.title}`}
                  />

                  <meta name="description" content={procedure.abstract} />
                  <meta name="DC.Description" content={procedure.abstract} />
                  <meta property="og:description" content={procedure.abstract} />

                  <meta name="keywords" content={procedure.tags.join(', ')} />

                  <meta name="page-type" content="article" />
                  <meta property="og:type" content="article" />

                  <meta property="og:url" content={`${DOMAIN_DESKTOP}${asPath}`} />
                  <meta
                    property="og:image"
                    content={`${DOMAIN_DESKTOP}${getImage(procedure.subjectGroups[0])}_1920.jpg`}
                  />
                </Head>
                <Wrapper>
                  <AsideLeft>
                    <ShareAside>
                      <ShareButtons />
                    </ShareAside>
                  </AsideLeft>
                  <ContentSection>
                    <ImageCol>
                      <Image
                        src={`${getImage(procedure.subjectGroups[0])}_1920.jpg`}
                        alt={procedure.subjectGroups[0]}
                      />
                    </ImageCol>
                    <Overview
                      title={procedure.title}
                      activityIndex={procedure.activityIndex.activityIndex}
                      subjectGroups={procedure.subjectGroups}
                      voteDate={procedure.voteDate}
                    />
                    <Tags tags={procedure.tags} />

                    <Collapse
                      defaultActiveKey={['details', 'documents', 'status', 'results']}
                      bordered={false}
                    >
                      <Panel header="Details" key="details" id="details">
                        <DetailsPanel
                          subjectGroups={procedure.subjectGroups}
                          currentStatus={procedure.currentStatus}
                          type={procedure.type}
                          procedureId={procedure.rocedureId}
                          submissionDate={procedure.submissionDate}
                          voteDate={procedure.voteDate}
                          abstract={procedure.abstract}
                        />
                      </Panel>

                      <Panel header="Dokumente" key="documents" id="documents">
                        <DocumentsPanel documents={procedure.importantDocuments} />
                      </Panel>
                      {procedure.currentStatusHistory.length > 0 && (
                        <Panel header="Gesetzesstand" key="status" id="status">
                          <Timeline>
                            {procedure.currentStatusHistory.map(status => (
                              <Timeline.Item key={status}>{status}</Timeline.Item>
                            ))}
                          </Timeline>
                        </Panel>
                      )}
                      <Panel header="Ergebnisse" key="results" id="results">
                        <VoteResultsPanel />
                      </Panel>
                    </Collapse>
                    <WhiteColPad>
                      <Collapse defaultActiveKey={['vote']} bordered={false}>
                        <Panel header="AppStimmen" key="vote" id="vote">
                          <AppStimmen />
                        </Panel>
                      </Collapse>
                    </WhiteColPad>
                  </ContentSection>

                  <AsideRight>
                    <ASide>
                      <Anchor affix={true} style={{ backgroundColor: 'transparent' }}>
                        <AnchorLink
                          href="#top"
                          title={
                            <>
                              <b>1. {procedure.type}</b> - {procedure.procedureId}
                            </>
                          }
                        >
                          <AnchorLink href="#details" title="Details" />
                          <AnchorLink href="#documents" title="Dokumente" />
                          <AnchorLink href="#status" title="Gesetzesstand" />
                          <AnchorLink href="#results" title="Ergebnisse" />
                        </AnchorLink>
                        <AnchorLink href="#vote" title={<b>2. AppStimmen</b>} />
                      </Anchor>
                    </ASide>
                  </AsideRight>
                </Wrapper>
              </>
            );
          }}
        </Query>
      </Section>
    );
  }
}

export default withRouter(Details);
