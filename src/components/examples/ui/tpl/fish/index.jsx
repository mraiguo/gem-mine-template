import React, { Component } from 'react';
import { Form, Input, Tooltip, Select, Button, DatePicker, message } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

class UiForm extends Component {
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        message.success('成功提交，打开控制台查看');
        console.log('Received values of form: ', values);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 }
    };

    <FormItem {...formItemLayout}>
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </FormItem>;

    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem {...formItemLayout} label="邮箱">
          {getFieldDecorator('email', {
            rules: [
              {
                type: 'email',
                message: '邮箱格式不正确!'
              },
              {
                required: true,
                message: '请输入邮箱!'
              }
            ]
          })(<Input />)}
        </FormItem>
        <FormItem {...formItemLayout} label="日期">
          {getFieldDecorator('date-picker', {
            rules: [
              {
                type: 'object',
                required: true,
                message: '请选择日期!'
              }
            ]
          })(<DatePicker />)}
        </FormItem>
        <FormItem wrapperCol={{ span: 20, offset: 4 }}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create()(UiForm);
